import { eq, count, asc, desc, and, type SQL } from 'drizzle-orm';
import { db } from '@/db/drizzle';
import { notes } from '@workspace/db';
import { notFoundError, badRequestError } from '@/core/error-handler';
import { buildPaginatedResult, getOffset } from '@workspace/shared';
import type { ListNotesQuery, CreateNoteInput, UpdateNoteInput } from '@workspace/shared';
import { getTaskById } from '../tasks/task.service';

const sortColumnMap = {
    createdAt: notes.createdAt,
    title: notes.title,
} as const;

export const listNotes = async (query: ListNotesQuery) => {
    const { page, limit, sortBy, sortOrder, taskId } = query;
    const offset = getOffset({ page, limit });

    const conditions: SQL[] = [];
    if (taskId) conditions.push(eq(notes.taskId, taskId));

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const orderFn = sortOrder === 'desc' ? desc : asc;
    const sortColumn = sortColumnMap[sortBy];

    const [items, totalResult] = await Promise.all([
        db.query.notes.findMany({ where, limit, offset, orderBy: [orderFn(sortColumn)] }),
        db.select({ total: count() }).from(notes).where(where),
    ]);

    return buildPaginatedResult(items, totalResult[0]?.total ?? 0, { page, limit });
};

export const getNoteById = async (id: string) => {
    const note = await db.query.notes.findFirst({
        where: eq(notes.id, id),
        with: { task: true },
    });
    if (!note) throw notFoundError('Note', id);
    return note;
};

export const createNote = async (data: CreateNoteInput) => {
    // Verify parent task exists; will throw if not found
    await getTaskById(data.taskId);

    const [note] = await db.insert(notes).values(data).returning();
    if (!note) throw badRequestError('Failed to create note');
    return note;
};

export const updateNote = async (id: string, data: UpdateNoteInput) => {
    const [note] = await db.update(notes).set(data).where(eq(notes.id, id)).returning();
    if (!note) throw notFoundError('Note', id);
    return note;
};

export const deleteNote = async (id: string) => {
    const [note] = await db.delete(notes).where(eq(notes.id, id)).returning();
    if (!note) throw notFoundError('Note', id);
    return note;
};
