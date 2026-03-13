import { z } from 'zod';

// ─── Full Entity Schema ─────────────────────────────────────────────
export const noteSchema = z.object({
    id: z.string().uuid(),
    taskId: z.string().uuid(),
    title: z.string(),
    description: z.string().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

export type Note = z.infer<typeof noteSchema>;

// ─── Input Schemas ──────────────────────────────────────────────────
export const createNoteSchema = z.object({
    taskId: z.string().uuid('Invalid task ID format'),
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().max(5000).nullish(),
});

export const updateNoteSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(5000).nullish(),
}).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});

export const listNotesQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.enum(['createdAt', 'title']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    taskId: z.string().uuid('Invalid task ID format').optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type ListNotesQuery = z.infer<typeof listNotesQuerySchema>;
