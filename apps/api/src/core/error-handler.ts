export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, code: string, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export const notFoundError = (resource: string, id: string): AppError =>
    new AppError(`${resource} with id '${id}' not found`, 404, 'NOT_FOUND');

export const badRequestError = (message: string): AppError =>
    new AppError(message, 400, 'BAD_REQUEST');

export const conflictError = (message: string): AppError =>
    new AppError(message, 409, 'CONFLICT');

export const internalError = (message = 'Internal server error'): AppError =>
    new AppError(message, 500, 'INTERNAL_ERROR', false);
