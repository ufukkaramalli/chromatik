export type ServiceStatus = 'up' | 'down' | 'degraded';
export type OverallHealthStatus = 'operational' | 'degraded' | 'outage';

export interface IServiceCheck {
  status: ServiceStatus;
  message?: string;
  [key: string]: any;
}

export interface IHealthMemory {
  rssMb: number;
  heapUsedMb: number;
  heapTotalMb: number;
}

export interface IStorageDiskInfo {
  totalBytes: number;
  totalFormatted: string;
  freeBytes: number;
  freeFormatted: string;
  usedBytes: number;
  usedFormatted: string;
  percentUsed: number;
}

export interface IStorageCheck extends IServiceCheck {
  path: string;
  usedBytes?: number;
  usedMb?: number;
  usedFormatted?: string;
  disk?: IStorageDiskInfo;
}

export interface IHealthResponse {
  status: OverallHealthStatus;
  timestamp: string;
  uptimeSeconds: number;
  services: {
    api: IServiceCheck;
    database: IServiceCheck;
    storage: IStorageCheck;
    memory: IHealthMemory;
  };
}
