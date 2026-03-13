import { z } from 'zod';

export const offsetPaginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});

export type OffsetPagination = z.infer<typeof offsetPaginationSchema>;

export interface PaginatedResult<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const buildPaginatedResult = <T>(
    items: T[],
    total: number,
    pagination: OffsetPagination,
): PaginatedResult<T> => ({
    items,
    pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
    },
});

export const getOffset = (pagination: OffsetPagination): number =>
    (pagination.page - 1) * pagination.limit;
