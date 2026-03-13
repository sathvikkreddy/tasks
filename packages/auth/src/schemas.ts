import { z } from 'zod';

// ─── Response Schemas ───────────────────────────────────────────────

/** Schema for a user object returned by the API */
export const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    image: z.string().nullable().optional(),
    emailVerified: z.boolean(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

/** Schema for a session object returned by the API */
export const SessionSchema = z.object({
    id: z.string(),
    userId: z.string(),
    token: z.string(),
    expiresAt: z.coerce.date(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

/** Schema for auth API error responses */
export const AuthApiErrorSchema = z.object({
    code: z.string(),
    message: z.string(),
});
