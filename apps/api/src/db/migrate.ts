import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from '@/db/drizzle';
import { pinoLogger } from '@/core/logger';

const runMigrations = async (): Promise<void> => {
    pinoLogger.info('Running migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    pinoLogger.info('Migrations completed successfully.');
    process.exit(0);
};

runMigrations().catch((err: unknown) => {
    pinoLogger.error({ error: err }, 'Migration failed');
    process.exit(1);
});
