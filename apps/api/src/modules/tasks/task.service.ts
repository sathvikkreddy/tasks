import { eq, count, asc, desc, ilike, or, and, type SQL, inArray } from 'drizzle-orm';
import { db } from '@/db/drizzle';
import { tasks, taskTags } from '@workspace/db';
import { notFoundError, badRequestError } from '@/core/error-handler';
import { buildPaginatedResult, getOffset } from '@workspace/shared';
import type { ListTasksQuery, CreateTaskInput, UpdateTaskInput } from '@workspace/shared';

const sortColumnMap = {
    createdAt: tasks.createdAt,
    title: tasks.title,
    status: tasks.status,
} as const;

export const listTasks = async (query: ListTasksQuery) => {
    const { page, limit, sortBy, sortOrder, search, status } = query;
    const offset = getOffset({ page, limit });

    const conditions: SQL[] = [];
    if (status) conditions.push(eq(tasks.status, status));
    if (search) {
        const pattern = `%${search}%`;
        conditions.push(or(ilike(tasks.title, pattern), ilike(tasks.description, pattern))!);
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const orderFn = sortOrder === 'desc' ? desc : asc;
    const sortColumn = sortColumnMap[sortBy];

    const [items, totalResult] = await Promise.all([
        db.query.tasks.findMany({ 
            where, 
            limit, 
            offset, 
            orderBy: [orderFn(sortColumn)],
            with: { notes: true, taskTags: { with: { tag: true } } }
        }),
        db.select({ total: count() }).from(tasks).where(where),
    ]);

    return buildPaginatedResult(items, totalResult[0]?.total ?? 0, { page, limit });
};

export const getTaskById = async (id: string) => {
    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, id),
        with: { notes: true, taskTags: { with: { tag: true } } },
    });
    if (!task) throw notFoundError('Task', id);
    return task;
};

export const createTask = async (data: CreateTaskInput) => {
    const [task] = await db.insert(tasks).values(data).returning();
    if (!task) throw badRequestError('Failed to create task');
    return task;
};

export const updateTask = async (id: string, data: UpdateTaskInput) => {
    const [task] = await db.update(tasks).set(data).where(eq(tasks.id, id)).returning();
    if (!task) throw notFoundError('Task', id);
    return task;
};

export const deleteTask = async (id: string) => {
    const [task] = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    if (!task) throw notFoundError('Task', id);
    return task;
};

export const addTagsToTask = async (taskId: string, tagIds: string[]) => {
    // Verify task exists
    await getTaskById(taskId);

    // Insert associations (ignore conflicts for idempotency)
    await db.insert(taskTags)
        .values(tagIds.map((tagId) => ({ taskId, tagId })))
        .onConflictDoNothing();

    return getTaskById(taskId);
};

export const removeTagsFromTask = async (taskId: string, tagIds: string[]) => {
    if (tagIds.length === 0) throw badRequestError('At least one tag ID is required');
    await getTaskById(taskId);

    await db.delete(taskTags)
        .where(and(eq(taskTags.taskId, taskId), inArray(taskTags.tagId, tagIds)));

    return getTaskById(taskId);
};
