import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq, count, asc, desc, ilike, and, type SQL } from 'drizzle-orm';
import { router, publicProcedure } from '../trpc';
import { tags } from '@workspace/db';
import {
    listTagsQuerySchema,
    createTagSchema,
    updateTagSchema,
    buildPaginatedResult,
    getOffset,
} from '@workspace/shared';

const sortColumnMap = {
    createdAt: tags.createdAt,
    name: tags.name,
} as const;

export const tagsRouter = router({
    list: publicProcedure
        .input(listTagsQuerySchema)
        .query(async ({ ctx, input }) => {
            const { page, limit, sortBy, sortOrder, search } = input;
            const offset = getOffset({ page, limit });

            const conditions: SQL[] = [];
            if (search) conditions.push(ilike(tags.name, `%${search}%`));

            const where = conditions.length > 0 ? and(...conditions) : undefined;
            const orderFn = sortOrder === 'desc' ? desc : asc;
            const sortColumn = sortColumnMap[sortBy];

            const [items, totalResult] = await Promise.all([
                ctx.db.query.tags.findMany({
                    where,
                    limit,
                    offset,
                    orderBy: [orderFn(sortColumn)],
                }),
                ctx.db.select({ total: count() }).from(tags).where(where),
            ]);

            return buildPaginatedResult(items, totalResult[0]?.total ?? 0, { page, limit });
        }),

    getById: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const tag = await ctx.db.query.tags.findFirst({
                where: eq(tags.id, input.id),
                with: { taskTags: { with: { task: true } } },
            });
            if (!tag) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Tag with id ${input.id} not found` });
            }
            return tag;
        }),

    create: publicProcedure
        .input(createTagSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const [tag] = await ctx.db.insert(tags).values(input).returning();
                if (!tag) {
                    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create tag' });
                }
                return tag;
            } catch (err: unknown) {
                if (err instanceof Error && err.message.includes('unique')) {
                    throw new TRPCError({ code: 'CONFLICT', message: `Tag with name '${input.name}' already exists` });
                }
                throw err;
            }
        }),

    update: publicProcedure
        .input(z.object({ id: z.string().uuid(), data: updateTagSchema }))
        .mutation(async ({ ctx, input }) => {
            try {
                const [tag] = await ctx.db
                    .update(tags)
                    .set(input.data)
                    .where(eq(tags.id, input.id))
                    .returning();
                if (!tag) {
                    throw new TRPCError({ code: 'NOT_FOUND', message: `Tag with id ${input.id} not found` });
                }
                return tag;
            } catch (err: unknown) {
                if (err instanceof Error && err.message.includes('unique')) {
                    throw new TRPCError({ code: 'CONFLICT', message: `Tag with name '${input.data.name}' already exists` });
                }
                throw err;
            }
        }),

    delete: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const [tag] = await ctx.db
                .delete(tags)
                .where(eq(tags.id, input.id))
                .returning();
            if (!tag) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Tag with id ${input.id} not found` });
            }
            return tag;
        }),
});
