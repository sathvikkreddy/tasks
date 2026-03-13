import { db } from '@/db/drizzle';
import { tasks, notes, tags, taskTags } from '@workspace/db';
import { pinoLogger } from '@/core/logger';
import type { InferInsertModel } from 'drizzle-orm';

type NewTask = InferInsertModel<typeof tasks>;
type NewNote = InferInsertModel<typeof notes>;
type NewTag = InferInsertModel<typeof tags>;

const sampleTasks: NewTask[] = [
    { title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions', status: 'done' },
    { title: 'Design database schema', description: 'Create Drizzle ORM schema', status: 'done' },
    { title: 'Implement authentication', description: 'Add JWT-based auth', status: 'in_progress' },
    { title: 'Write API documentation', description: 'Generate OpenAPI spec', status: 'in_progress' },
    { title: 'Add rate limiting', description: 'Sliding window rate limiter', status: 'todo' },
    { title: 'Set up monitoring', description: 'Add health checks and alerting', status: 'todo' },
    { title: 'Write integration tests', description: 'Test all API endpoints', status: 'todo' },
];

const sampleTags: NewTag[] = [
    { name: 'backend', color: '#6366f1' },
    { name: 'devops', color: '#f59e0b' },
    { name: 'security', color: '#ef4444' },
    { name: 'documentation', color: '#10b981' },
];

const seed = async (): Promise<void> => {
    pinoLogger.info('Seeding database...');

    const insertedTasks = await db.insert(tasks).values(sampleTasks).returning();
    pinoLogger.info(`Seeded ${insertedTasks.length} tasks.`);

    const sampleNotes: NewNote[] = [
        { taskId: insertedTasks[0]!.id, title: 'Use GitHub Actions', description: 'Set up workflows for CI/CD' },
        { taskId: insertedTasks[0]!.id, title: 'Add deployment step', description: 'Deploy to staging on merge' },
        { taskId: insertedTasks[2]!.id, title: 'Research JWT libraries', description: 'Compare jose vs jsonwebtoken' },
    ];

    await db.insert(notes).values(sampleNotes);
    pinoLogger.info(`Seeded ${sampleNotes.length} notes.`);

    const insertedTags = await db.insert(tags).values(sampleTags).returning();
    pinoLogger.info(`Seeded ${insertedTags.length} tags.`);

    // Link some tasks to tags
    await db.insert(taskTags).values([
        { taskId: insertedTasks[0]!.id, tagId: insertedTags[1]!.id }, // CI/CD → devops
        { taskId: insertedTasks[1]!.id, tagId: insertedTags[0]!.id }, // DB schema → backend
        { taskId: insertedTasks[2]!.id, tagId: insertedTags[2]!.id }, // Auth → security
        { taskId: insertedTasks[2]!.id, tagId: insertedTags[0]!.id }, // Auth → backend
        { taskId: insertedTasks[3]!.id, tagId: insertedTags[3]!.id }, // Docs → documentation
    ]);
    pinoLogger.info('Seeded task-tag associations.');

    process.exit(0);
};

seed().catch((err: unknown) => {
    pinoLogger.error({ error: err }, 'Seed failed');
    process.exit(1);
});
