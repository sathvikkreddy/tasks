import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq, count, asc, desc, and, type SQL } from 'drizzle-orm';
import { router, publicProcedure } from '../trpc';
import { notes, tasks } from '@workspace/db';
import {
    listNotesQuerySchema,
    createNoteSchema,
    updateNoteSchema,
    buildPaginatedResult,
    getOffset,
} from '@workspace/shared';

const sortColumnMap = {
    createdAt: notes.createdAt,
    title: notes.title,
} as const;

export const notesRouter = router({
    list: publicProcedure
        .input(listNotesQuerySchema)
        .query(async ({ ctx, input }) => {
            const { page, limit, sortBy, sortOrder, taskId } = input;
            const offset = getOffset({ page, limit });

            const conditions: SQL[] = [];
            if (taskId) conditions.push(eq(notes.taskId, taskId));

            const where = conditions.length > 0 ? and(...conditions) : undefined;
            const orderFn = sortOrder === 'desc' ? desc : asc;
            const sortColumn = sortColumnMap[sortBy];

            const [items, totalResult] = await Promise.all([
                ctx.db.query.notes.findMany({
                    where,
                    limit,
                    offset,
                    orderBy: [orderFn(sortColumn)],
                }),
                ctx.db.select({ total: count() }).from(notes).where(where),
            ]);

            return buildPaginatedResult(items, totalResult[0]?.total ?? 0, { page, limit });
        }),

    getById: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const note = await ctx.db.query.notes.findFirst({
                where: eq(notes.id, input.id),
                with: { task: true },
            });
            if (!note) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Note with id ${input.id} not found` });
            }
            return note;
        }),

    create: publicProcedure
        .input(createNoteSchema)
        .mutation(async ({ ctx, input }) => {
            // Verify parent task exists
            const task = await ctx.db.query.tasks.findFirst({
                where: eq(tasks.id, input.taskId),
            });
            if (!task) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Task with id ${input.taskId} not found` });
            }

            const [note] = await ctx.db.insert(notes).values(input).returning();
            if (!note) {
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create note' });
            }
            return note;
        }),

    update: publicProcedure
        .input(z.object({ id: z.string().uuid(), data: updateNoteSchema }))
        .mutation(async ({ ctx, input }) => {
            const [note] = await ctx.db
                .update(notes)
                .set(input.data)
                .where(eq(notes.id, input.id))
                .returning();
            if (!note) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Note with id ${input.id} not found` });
            }
            return note;
        }),

    delete: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const [note] = await ctx.db
                .delete(notes)
                .where(eq(notes.id, input.id))
                .returning();
            if (!note) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Note with id ${input.id} not found` });
            }
            return note;
        }),
});
