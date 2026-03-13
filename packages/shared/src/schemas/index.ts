import z from 'zod';

export * from './task';
export * from './note';
export * from './tag';

export const idParamSchema = z.object({
    id: z.uuid('Invalid ID format'),
});