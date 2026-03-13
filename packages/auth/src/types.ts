import type { z } from 'zod';
import type { UserSchema, SessionSchema, AuthApiErrorSchema } from './schemas';

// ─── Inferred Types ─────────────────────────────────────────────────

/** A user object as returned by the auth API */
export type User = z.infer<typeof UserSchema>;

/** A session object as returned by the auth API */
export type Session = z.infer<typeof SessionSchema>;

/** Auth API error response shape */
export type AuthApiError = z.infer<typeof AuthApiErrorSchema>;
