import type { z } from 'zod';
import type { ValidationTargets } from 'hono';
import { zValidator as zv } from '@hono/zod-validator';

/**
 * Wrapper around @hono/zod-validator that returns a consistent
 * error response format on validation failure.
 */
export const zValidator = <T extends z.ZodType, Target extends keyof ValidationTargets>(
    target: Target,
    schema: T,
) =>
    zv(target, schema, ((result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }, c: { json: (body: unknown, status: number) => Response }) => {
        if (!result.success) {
            const messages = result.error!.issues.map(
                (i) => `${i.path.join('.')}: ${i.message}`,
            );
            return c.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: messages.join('; ') } },
                400,
            );
        }
    }) as Parameters<typeof zv>[2]);
