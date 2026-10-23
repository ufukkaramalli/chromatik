import { Request, Response, NextFunction, Router } from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import IController from '../../interfaces/controller.interface';
import {
  IServiceCheck,
  IStorageCheck,
  IStorageDiskInfo,
  IHealthResponse,
  OverallHealthStatus
} from '../../interfaces/health.interface';
import logger from '../../utils/logger';

const MONGO_STATES: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

class HealthController implements IController {
  public path = '/health';
  public router: Router = Router();

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes(): void {
    this.router.get(`${this.path}`, this.getHealth);
    this.router.get(`${this.path}/ping`, this.ping);
  }

  /**
   * Fast ping endpoint for load balancers and orchestrators
   */
  private ping = (req: Request, res: Response): void => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  };

  /**
   * Measures MongoDB latency and validates connection
   */
  private async checkDatabase(): Promise<IServiceCheck> {
    const start = Date.now();
    const readyState = mongoose.connection.readyState;
    const stateName = MONGO_STATES[readyState] || 'unknown';

    if (readyState !== 1) {
      return {
        status: 'down',
        state: stateName,
        latencyMs: 0,
        message: `Database is not connected (state: ${stateName})`
      };
    }

    try {
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
      }
      const latencyMs = Date.now() - start;
      const isSlow = latencyMs > 300;

      return {
        status: isSlow ? 'degraded' : 'up',
        state: stateName,
        latencyMs,
        message: isSlow ? 'High database latency' : 'Database operational'
      };
    } catch (error: any) {
      logger.error('HealthCheck: Database ping failed', error);
      return {
        status: 'down',
        state: stateName,
        latencyMs: Date.now() - start,
        message: error?.message || 'Failed to ping database'
      };
    }
  }

  /**
   * Helper to format raw bytes into human readable string (KB, MB, GB)
   */
  private formatBytes(bytes: number, decimals: number = 1): string {
    if (!+bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  /**
   * In-memory cache for media directory size calculation to avoid heavy disk I/O on repeated health queries
   */
  private cachedMediaSize: { bytes: number; timestamp: number } | null = null;
  private readonly MEDIA_SIZE_CACHE_TTL_MS = 60 * 1000;

  /**
   * Recursively measures the total byte size of files in the media folder
   */
  private async getMediaDirectoryBytes(dirPath: string): Promise<number> {
    const now = Date.now();
    if (this.cachedMediaSize && now - this.cachedMediaSize.timestamp < this.MEDIA_SIZE_CACHE_TTL_MS) {
      return this.cachedMediaSize.bytes;
    }
    let totalBytes = 0;
    try {
      const scanDir = async (currentDir: string): Promise<void> => {
        const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);
          if (entry.isDirectory()) {
            await scanDir(fullPath);
          } else if (entry.isFile()) {
            try {
              const stat = await fs.promises.stat(fullPath);
              totalBytes += stat.size;
            } catch {
              // File might have been modified/removed concurrently
            }
          }
        }
      };
      await scanDir(dirPath);
      this.cachedMediaSize = { bytes: totalBytes, timestamp: now };
      return totalBytes;
    } catch (error) {
      logger.warn(`HealthCheck: Could not measure media directory size for ${dirPath}`, error);
      return this.cachedMediaSize ? this.cachedMediaSize.bytes : 0;
    }
  }

  /**
   * Resolves the active media directory path across Docker, dev, and production environments
   */
  private resolveMediaDir(): string {
    const envDir = process.env.MEDIA_DIR;
    if (envDir && fs.existsSync(envDir)) return envDir;
    if (fs.existsSync(path.resolve('../media'))) return path.resolve('../media');
    if (fs.existsSync(path.resolve('./media'))) return path.resolve('./media');
    return envDir || '/srv/chromatik/media';
  }

  /**
   * Validates file storage directory access and measures stored media size and disk volume capacity
   */
  private async checkStorage(): Promise<IStorageCheck> {
    const mediaDir = this.resolveMediaDir();
    try {
      await fs.promises.access(mediaDir, fs.constants.R_OK);

      const [usedBytes, stats] = await Promise.all([
        this.getMediaDirectoryBytes(mediaDir),
        typeof (fs.promises as any).statfs === 'function'
          ? ((fs.promises as any).statfs(mediaDir) as Promise<any>).catch(() => null)
          : Promise.resolve(null)
      ]);

      let diskInfo: IStorageDiskInfo | undefined;
      if (stats && stats.blocks > 0) {
        const totalBytes = stats.blocks * stats.bsize;
        const freeBytes = (stats.bavail !== undefined ? stats.bavail : stats.bfree) * stats.bsize;
        const usedDiskBytes = (stats.blocks - stats.bfree) * stats.bsize;
        const percentUsed = totalBytes > 0 ? Math.round(((totalBytes - freeBytes) / totalBytes) * 100) : 0;
        diskInfo = {
          totalBytes,
          totalFormatted: this.formatBytes(totalBytes),
          freeBytes,
          freeFormatted: this.formatBytes(freeBytes),
          usedBytes: usedDiskBytes,
          usedFormatted: this.formatBytes(usedDiskBytes),
          percentUsed
        };
      }

      return {
        status: 'up',
        path: mediaDir,
        usedBytes,
        usedMb: Math.round((usedBytes / (1024 * 1024)) * 10) / 10,
        usedFormatted: this.formatBytes(usedBytes),
        disk: diskInfo,
        message: 'Storage volume accessible'
      };
    } catch (error: any) {
      logger.warn(`HealthCheck: Storage path ${mediaDir} inaccessible`, error);
      return {
        status: 'degraded',
        path: mediaDir,
        message: 'Storage volume not directly accessible'
      };
    }
  }

  /**
   * @openapi
   * /api/health:
   *   get:
   *     tags:
   *       - System
   *     summary: Real-time system health and service operational metrics
   *     responses:
   *       200:
   *         description: System health status
   *       503:
   *         description: Service outage
   */
  private getHealth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const [database, storage] = await Promise.all([
        this.checkDatabase(),
        this.checkStorage()
      ]);

      const mem = process.memoryUsage();
      const memory = {
        rssMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
        heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100
      };

      const api: IServiceCheck = {
        status: 'up',
        version: process.env.npm_package_version || '0.4.0',
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
      };

      let overallStatus: OverallHealthStatus = 'operational';

      if (database.status === 'down') {
        overallStatus = 'outage';
      } else if (database.status === 'degraded' || storage.status === 'degraded') {
        overallStatus = 'degraded';
      }

      const response: IHealthResponse = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        services: {
          api,
          database,
          storage,
          memory
        }
      };

      const statusCode = overallStatus === 'outage' ? 503 : 200;
      res.status(statusCode).json(response);
    } catch (error) {
      logger.error('HealthCheck: Unexpected error', error);
      next(error);
    }
  };
}

export default HealthController;
