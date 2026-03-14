import { env } from '@/config/env';
import { pinoLogger } from '@/core/logger';
import { createApp } from '@/app';
import { serve } from '@hono/node-server';

const app = createApp();

serve(
    {
        fetch: app.fetch,
        port: env.PORT,
        hostname: '0.0.0.0',
    },
    (info) => {
        pinoLogger.info(
            { port: info.port, hostname: info.address },
            `🚀 Server running on http://${info.address}:${info.port}`,
        );
    },
);

// ─── Graceful Shutdown ──────────────────────────────────────────────
process.on('SIGTERM', () => {
    pinoLogger.info('SIGTERM received');
    process.exit(0);
});

process.on('SIGINT', () => {
    pinoLogger.info('SIGINT received');
    process.exit(0);
});

process.on('unhandledRejection', (reason) => {
    pinoLogger.fatal({ reason }, 'Unhandled rejection');
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    pinoLogger.fatal({ error: err.message }, 'Uncaught exception');
    process.exit(1);
});
