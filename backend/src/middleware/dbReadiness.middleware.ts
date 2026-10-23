import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import {
  DB_UNAVAILABLE_CODE,
  DB_UNAVAILABLE_RETRY_AFTER_SECONDS,
  IServiceUnavailableResponse
} from '../interfaces/serviceAvailability.interface';

/** Paths (relative to the mount point) that must stay reachable without a database. */
const EXEMPT_PATH_PREFIXES = ['/health'];

const MONGOOSE_CONNECTED = 1;

/**
 * Short-circuits API requests with a fast 503 while MongoDB is not connected,
 * instead of letting Mongoose buffer queries and time out after ~10 seconds.
 */
function dbReadinessMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (EXEMPT_PATH_PREFIXES.some((prefix) => req.path.startsWith(prefix))) {
    return next();
  }

  if (mongoose.connection.readyState === MONGOOSE_CONNECTED) {
    return next();
  }

  sendDbUnavailable(res);
}

export function sendDbUnavailable(res: Response): void {
  const body: IServiceUnavailableResponse = {
    status: 503,
    code: DB_UNAVAILABLE_CODE,
    message: 'Database temporarily unavailable, please retry shortly',
    retryAfter: DB_UNAVAILABLE_RETRY_AFTER_SECONDS
  };

  res.setHeader('Retry-After', String(DB_UNAVAILABLE_RETRY_AFTER_SECONDS));
  res.status(503).json(body);
}

export default dbReadinessMiddleware;
