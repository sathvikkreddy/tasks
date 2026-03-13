import { env } from '@/config/env';
import { pinoLogger } from '@/core/logger';
import { createApp } from '@/app';

const app = createApp();

pinoLogger.info(
    { port: env.PORT, env: env.NODE_ENV },
    `🚀 Server running on http://localhost:${env.PORT}`,
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

export default { port: env.PORT, fetch: app.fetch };
