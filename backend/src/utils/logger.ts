// src/utils/logger.ts
import { Request, Response, NextFunction } from 'express';
import { createLogger, format, transports } from 'winston';
const colors = {
  red: (s: string) => `[31m${s}[0m`,
  yellow: (s: string) => `[33m${s}[0m`,
  blue: (s: string) => `[34m${s}[0m`,
  green: (s: string) => `[32m${s}[0m`,
};
import path from 'path';
import fs from 'fs';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, json } = format;

// Logs dizinini oluştur
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// Development format (renkli)
const devFormat = printf(({ level, message, timestamp }) => {
  let levelColor: string;
  switch (level) {
    case 'error':
      levelColor = colors.red(`[${level.toUpperCase()}]`);
      break;
    case 'warn':
      levelColor = colors.yellow(`[${level.toUpperCase()}]`);
      break;
    case 'info':
      levelColor = colors.blue(`[${level.toUpperCase()}]`);
      break;
    case 'debug':
      levelColor = colors.green(`[${level.toUpperCase()}]`);
      break;
    default:
      levelColor = `[${level.toUpperCase()}]`;
  }
  return `${levelColor} ${timestamp} ${message}`;
});

// Timezone & Timestamp formatting
const TIMEZONE = process.env.TZ || 'Europe/Istanbul';

const localTimestamp = format((info) => {
  info.timestamp = new Date().toLocaleString('sv-SE', { timeZone: TIMEZONE });
  return info;
});

const localTimeOnly = format((info) => {
  info.timestamp = new Date().toLocaleTimeString('tr-TR', {
    timeZone: TIMEZONE,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return info;
});

// Production format (JSON with Istanbul date-time)
const prodFormat = combine(localTimestamp(), json());

// Daily rotate file transport
const DailyRotateFile = require('winston-daily-rotate-file');

const errorRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxFiles: '14d',
  format: prodFormat,
});

const requestRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'requests-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'info',
  maxFiles: '14d',
  format: prodFormat,
});

// Logger instance
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format:
    process.env.NODE_ENV === 'production'
      ? prodFormat
      : combine(localTimeOnly(), devFormat),
  transports: [
    new transports.Console(),
    errorRotateTransport,
    requestRotateTransport,
  ],
});

// ----- Request/Response Logger Middleware -----
export const requestResponseLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Orijinal res.send metodunu kaydet
  const originalSend = res.send;

  // Override res.send
  res.send = function (body?: any): Response {
    const duration = Date.now() - start;
    const messageParts = [
      `${req.method} ${req.originalUrl}`,
      `Status: ${res.statusCode}`,
      `Duration: ${duration}ms`,
    ];

    if (process.env.NODE_ENV !== 'production') {
      // Dev ortamında response body loglanır
      messageParts.push(`Response: ${JSON.stringify(body)}`);
    }

    logger.info(messageParts.join(' | '));

    return originalSend.call(this, body);
  };

  next();
};

// ----- Error Logger Middleware -----
export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction) => {
  const messageParts = [
    `${req.method} ${req.originalUrl}`,
    `Status: ${res.statusCode}`,
    `Message: ${err.message}`,
  ];

  if (err.stack) {
    messageParts.push(`Stack: ${err.stack}`);
  }

  logger.error(messageParts.join(' | '));

  next(err);
};

export default logger;