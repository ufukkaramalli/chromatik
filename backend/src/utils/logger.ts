// src/utils/logger.ts
import { Request, Response, NextFunction } from 'express';
import { createLogger, format, transports } from 'winston';
import chalk from 'chalk';
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
      levelColor = chalk.red(`[${level.toUpperCase()}]`);
      break;
    case 'warn':
      levelColor = chalk.yellow(`[${level.toUpperCase()}]`);
      break;
    case 'info':
      levelColor = chalk.blue(`[${level.toUpperCase()}]`);
      break;
    case 'debug':
      levelColor = chalk.green(`[${level.toUpperCase()}]`);
      break;
    default:
      levelColor = `[${level.toUpperCase()}]`;
  }
  return `${levelColor} ${timestamp} ${message}`;
});

// Production format (JSON)
const prodFormat = combine(timestamp(), json());

// Daily rotate file transport
const DailyRotateFile = require('winston-daily-rotate-file');

const errorRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxFiles: '14d',
});

const requestRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'requests-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'info',
  maxFiles: '14d',
});

// Logger instance
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format:
    process.env.NODE_ENV === 'production'
      ? prodFormat
      : combine(timestamp({ format: 'HH:mm:ss' }), devFormat),
  transports: [
    new transports.Console(),
    ...(process.env.NODE_ENV === 'production'
      ? [errorRotateTransport, requestRotateTransport]
      : []),
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