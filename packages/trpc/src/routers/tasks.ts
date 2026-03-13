import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq, count, asc, desc, ilike, or, and, type SQL, inArray } from 'drizzle-orm';
import { router, publicProcedure } from '../trpc';
import { tasks, taskTags } from '@workspace/db';
import {
    listTasksQuerySchema,
    createTaskSchema,
    updateTaskSchema,
    taskTagsBodySchema,
    buildPaginatedResult,
    getOffset,
} from '@workspace/shared';

const sortColumnMap = {
    createdAt: tasks.createdAt,
    title: tasks.title,
    status: tasks.status,
} as const;

export const tasksRouter = router({
    list: publicProcedure
        .input(listTasksQuerySchema)
        .query(async ({ ctx, input }) => {
            const { page, limit, sortBy, sortOrder, search, status } = input;
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
                ctx.db.query.tasks.findMany({
                    where,
                    limit,
                    offset,
                    orderBy: [orderFn(sortColumn)],
                    with: { notes: true, taskTags: { with: { tag: true } } },
                }),
                ctx.db.select({ total: count() }).from(tasks).where(where),
            ]);

            return buildPaginatedResult(items, totalResult[0]?.total ?? 0, { page, limit });
        }),

    getById: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const task = await ctx.db.query.tasks.findFirst({
                where: eq(tasks.id, input.id),
                with: { notes: true, taskTags: { with: { tag: true } } },
            });
            if (!task) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Task with id ${input.id} not found` });
            }
            return task;
        }),

    create: publicProcedure
        .input(createTaskSchema)
        .mutation(async ({ ctx, input }) => {
            const [task] = await ctx.db.insert(tasks).values(input).returning();
            if (!task) {
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create task' });
            }
            return task;
        }),

    update: publicProcedure
        .input(z.object({ id: z.uuid(), data: updateTaskSchema }))
        .mutation(async ({ ctx, input }) => {
            const [task] = await ctx.db
                .update(tasks)
                .set(input.data)
                .where(eq(tasks.id, input.id))
                .returning();
            if (!task) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Task with id ${input.id} not found` });
            }
            return task;
        }),

    delete: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const [task] = await ctx.db
                .delete(tasks)
                .where(eq(tasks.id, input.id))
                .returning();
            if (!task) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Task with id ${input.id} not found` });
            }
            return task;
        }),

    addTags: publicProcedure
        .input(z.object({ taskId: z.string().uuid(), data: taskTagsBodySchema }))
        .mutation(async ({ ctx, input }) => {
            // Verify task exists
            const task = await ctx.db.query.tasks.findFirst({
                where: eq(tasks.id, input.taskId),
            });
            if (!task) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Task with id ${input.taskId} not found` });
            }

            // Insert associations (ignore conflicts for idempotency)
            if (input.data.tagIds.length > 0) {
                await ctx.db
                    .insert(taskTags)
                    .values(input.data.tagIds.map((tagId) => ({ taskId: input.taskId, tagId })))
                    .onConflictDoNothing();
            }

            const updatedTask = await ctx.db.query.tasks.findFirst({
                where: eq(tasks.id, input.taskId),
                with: { notes: true, taskTags: { with: { tag: true } } },
            });
            if (!updatedTask) throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found after update' });
            return updatedTask;
        }),

    removeTags: publicProcedure
        .input(z.object({ taskId: z.string().uuid(), data: taskTagsBodySchema }))
        .mutation(async ({ ctx, input }) => {
            if (input.data.tagIds.length === 0) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'At least one tag ID is required' });
            }
            
            // Verify task exists
            const task = await ctx.db.query.tasks.findFirst({
                where: eq(tasks.id, input.taskId),
            });
            if (!task) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Task with id ${input.taskId} not found` });
            }

            await ctx.db
                .delete(taskTags)
                .where(and(eq(taskTags.taskId, input.taskId), inArray(taskTags.tagId, input.data.tagIds)));

            const updatedTask = await ctx.db.query.tasks.findFirst({
                where: eq(tasks.id, input.taskId),
                with: { notes: true, taskTags: { with: { tag: true } } },
            });
            if (!updatedTask) throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found after update' });
            return updatedTask;
        }),
});