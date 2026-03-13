import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { requestId } from 'hono/request-id';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { AppError } from '@/core/error-handler';
import { pinoLogger } from '@/core/logger';
// import { auth } from '@/lib/auth';
import { authMiddleware, type AuthVariables } from '@/core/auth-middleware';
import taskRouter from '@/modules/tasks/task.router';
import noteRouter from '@/modules/notes/note.router';
import tagRouter from '@/modules/tags/tag.router';
import { appRouter } from '@workspace/trpc';
import { trpcServer } from '@hono/trpc-server';
import { db } from '@/db/drizzle';

export const createApp = () => {
    const app = new Hono<{ Variables: AuthVariables }>();

    // ─── Global Middleware ──────────────────────────────────────────────
    app.use(
        '*',
        cors({
            origin: process.env['FRONTEND_URL'] || 'http://localhost:3001',
            allowHeaders: ['Content-Type', 'Authorization'],
            allowMethods: ['POST', 'GET', 'OPTIONS'],
            exposeHeaders: ['Content-Length'],
            maxAge: 600,
            credentials: true,
        }),
    );
    app.use('*', requestId());
    app.use('*', logger());

    // ─── Health Check ───────────────────────────────────────────────────
    app.get('/health', (c) =>
        c.json({
            success: true,
            data: {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            },
        }),
    );

    // ─── Auth Me Route ──────────────────────────────────────────────────
    app.get('/api/auth/me', authMiddleware, (c) => {
        const user = c.get('user');
        const session = c.get('session');
        return c.json({ success: true, data: { user, session } });
    });

    // ─── Better Auth Handler ────────────────────────────────────────────
    // app.on(['GET', 'POST'], '/api/auth/*', (c) => {
    //     return auth.handler(c.req.raw);
    // });

    // ─── tRPC Handler ───────────────────────────────────────────────────
    // app.use('/api/trpc/*', authMiddleware);
    app.use('/api/trpc/*', trpcServer({
        router: appRouter,
        createContext: (_opts, _c) => ({
            db,
        }),
    }));

    // ─── API Routes ─────────────────────────────────────────────────────
    // Tasks are publicly accessible (no auth required)
    app.route('/api/v1/tasks', taskRouter);

    // Notes and tags require authentication
    app.use('/api/v1/notes/*', authMiddleware);
    app.use('/api/v1/tags/*', authMiddleware);
    app.route('/api/v1/notes', noteRouter);
    app.route('/api/v1/tags', tagRouter);

    // ─── 404 Handler ────────────────────────────────────────────────────
    app.notFound((c) =>
        c.json(
            { success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } },
            404,
        ),
    );

    // ─── Global Error Handler ──────────────────────────────────────────
    app.onError((err, c) => {
        if (err instanceof HTTPException) {
            return c.json(
                { success: false, error: { code: 'HTTP_ERROR', message: err.message } },
                err.status,
            );
        }

        if (err instanceof ZodError) {
            const messages = err.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
            return c.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: messages.join('; ') } },
                400,
            );
        }

        if (err instanceof AppError) {
            pinoLogger.warn(
                { requestId: c.get('requestId'), code: err.code, statusCode: err.statusCode },
                `AppError: ${err.message}`,
            );
            return c.json(
                { success: false, error: { code: err.code, message: err.message } },
                err.statusCode as 400 | 404 | 409 | 500,
            );
        }

        pinoLogger.error(
            { requestId: c.get('requestId'), error: err.message, stack: err.stack },
            `Unhandled: ${err.message}`,
        );
        return c.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
            500,
        );
    });

    return app;
};
