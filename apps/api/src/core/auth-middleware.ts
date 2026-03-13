import { createMiddleware } from 'hono/factory';
import { auth } from '@/lib/auth';
import type { User, Session } from '@workspace/auth';

/** Hono context variables set by the auth middleware */
export type AuthVariables = {
    user: User;
    session: Session;
};

/**
 * Auth middleware that validates the session cookie.
 * On success, sets `user` and `session` on the Hono context.
 * On failure, returns a typed 401 JSON response.
 *
 * Usage:
 *   router.use(authMiddleware);
 *   // or on specific routes:
 *   router.get('/protected', authMiddleware, handler);
 */
export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
    async (c, next) => {
        const result = await auth.api.getSession({
            headers: c.req.raw.headers,
        });

        if (!result) {
            return c.json(
                {
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Valid authentication is required to access this resource',
                    },
                },
                401,
            );
        }

        c.set('user', result.user as User);
        c.set('session', result.session as Session);

        await next();
    },
);
