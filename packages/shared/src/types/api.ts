export const ErrorCode = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    BAD_REQUEST: 'BAD_REQUEST',
    CONFLICT: 'CONFLICT',
    HTTP_ERROR: 'HTTP_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
}

export interface ApiErrorResponse {
    success: false;
    error: {
        code: ErrorCode;
        message: string;
    };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
