import { Request, Response, NextFunction } from "express";
import HttpException from '.././utils/exceptions/http.exception';
import { sendDbUnavailable } from './dbReadiness.middleware';

/** Mongo / Mongoose error names that indicate the database is unreachable. */
const DB_CONNECTION_ERROR_NAMES = new Set([
    'MongooseServerSelectionError',
    'MongoServerSelectionError',
    'MongoNetworkError',
    'MongoNetworkTimeoutError',
    'MongoNotConnectedError',
    'MongoTopologyClosedError'
]);

function isDbConnectionError(error: any): boolean {
    if (!error) return false;
    if (DB_CONNECTION_ERROR_NAMES.has(error.name)) return true;
    // Mongoose buffering timeout, e.g. "Operation `tracks.find()` buffering timed out after 10000ms"
    return typeof error.message === 'string' && error.message.includes('buffering timed out');
}

function ErrorMiddleware (error:  HttpException, req: Request, res: Response,  next: NextFunction) : void {
    // Database dropped mid-request: answer with the same 503 contract as the readiness middleware
    if (isDbConnectionError(error)) {
        sendDbUnavailable(res);
        return;
    }

    const status = error.status || 500;
    const message = error.message || 'Something went wrong';

    res.status(status).send({
        status,
        message
    })
}

export default ErrorMiddleware