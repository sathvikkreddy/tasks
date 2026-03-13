import { eq, count, asc, desc, ilike, and, type SQL } from 'drizzle-orm';
import { db } from '@/db/drizzle';
import { tags } from '@workspace/db';
import { notFoundError, conflictError, badRequestError } from '@/core/error-handler';
import { buildPaginatedResult, getOffset } from '@workspace/shared';
import type { ListTagsQuery, CreateTagInput, UpdateTagInput } from '@workspace/shared';

const sortColumnMap = {
    createdAt: tags.createdAt,
    name: tags.name,
} as const;

export const listTags = async (query: ListTagsQuery) => {
    const { page, limit, sortBy, sortOrder, search } = query;
    const offset = getOffset({ page, limit });

    const conditions: SQL[] = [];
    if (search) conditions.push(ilike(tags.name, `%${search}%`));

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const orderFn = sortOrder === 'desc' ? desc : asc;
    const sortColumn = sortColumnMap[sortBy];

    const [items, totalResult] = await Promise.all([
        db.query.tags.findMany({ where, limit, offset, orderBy: [orderFn(sortColumn)] }),
        db.select({ total: count() }).from(tags).where(where),
    ]);

    return buildPaginatedResult(items, totalResult[0]?.total ?? 0, { page, limit });
};

export const getTagById = async (id: string) => {
    const tag = await db.query.tags.findFirst({
        where: eq(tags.id, id),
        with: { taskTags: { with: { task: true } } },
    });
    if (!tag) throw notFoundError('Tag', id);
    return tag;
};

export const createTag = async (data: CreateTagInput) => {
    try {
        const [tag] = await db.insert(tags).values(data).returning();
        if (!tag) throw badRequestError('Failed to create tag');
        return tag;
    } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('unique')) {
            throw conflictError(`Tag with name '${data.name}' already exists`);
        }
        throw err;
    }
};

export const updateTag = async (id: string, data: UpdateTagInput) => {
    try {
        const [tag] = await db.update(tags).set(data).where(eq(tags.id, id)).returning();
        if (!tag) throw notFoundError('Tag', id);
        return tag;
    } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('unique')) {
            throw conflictError(`Tag with name '${data.name}' already exists`);
        }
        throw err;
    }
};

export const deleteTag = async (id: string) => {
    const [tag] = await db.delete(tags).where(eq(tags.id, id)).returning();
    if (!tag) throw notFoundError('Tag', id);
    return tag;
};
