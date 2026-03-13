import pino from 'pino';
import { env } from '@/config/env';

export const pinoLogger = pino({
    level: env.LOG_LEVEL,
    transport:
        env.NODE_ENV === 'development'
            ? { target: 'pino/file', options: { destination: 1 } }
            : undefined,
    formatters: { level: (label) => ({ level: label }) },
    timestamp: pino.stdTimeFunctions.isoTime,
});

export const createChildLogger = (context: Record<string, unknown>) =>
    pinoLogger.child(context);
