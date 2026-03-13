import { z } from 'zod';

// ─── Full Entity Schema ─────────────────────────────────────────────
export const tagSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    color: z.string(),
    createdAt: z.coerce.date(),
});

export type Tag = z.infer<typeof tagSchema>;

// ─── Input Schemas ──────────────────────────────────────────────────
export const createTagSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a valid hex color (e.g., #6366f1)').optional().default('#6366f1'),
});

export const updateTagSchema = z.object({
    name: z.string().min(1).max(50).optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a valid hex color').optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});

export const listTagsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.enum(['createdAt', 'name']).default('name'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
    search: z.string().max(100).optional(),
});

export type ListTagsQuery = z.infer<typeof listTagsQuerySchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
