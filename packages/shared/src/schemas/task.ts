import { z } from 'zod';
import { taskStatusValues } from '../types/task';
import { noteSchema } from './note';
import { tagSchema } from './tag';

// ─── Full Entity Schema ─────────────────────────────────────────────
export const taskSchema = z.object({
    id: z.uuid(),
    title: z.string(),
    description: z.string().nullable(),
    status: z.enum(taskStatusValues),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

export type Task = z.infer<typeof taskSchema>;

// ─── Entity With Relations Schema ───────────────────────────────────
export const taskWithRelationsSchema = taskSchema.extend({
    notes: z.array(noteSchema).default([]),
    taskTags: z.array(z.object({
        tag: tagSchema
    })).default([]),
});

export type TaskWithRelations = z.infer<typeof taskWithRelationsSchema>;

// ─── Input Schemas ──────────────────────────────────────────────────
export const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().max(2000).nullish(),
    status: z.enum(taskStatusValues).optional().default('todo'),
});

export const updateTaskSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).nullish(),
    status: z.enum(taskStatusValues).optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});

export const listTasksQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.enum(['createdAt', 'title', 'status']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().max(200).optional(),
    status: z.enum(taskStatusValues).optional(),
});

export const taskTagsBodySchema = z.object({
    tagIds: z.array(z.uuid('Invalid tag ID format')).min(1, 'At least one tag ID is required'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
export type TaskTagsBody = z.infer<typeof taskTagsBodySchema>;
