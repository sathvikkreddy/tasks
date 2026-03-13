import { Hono } from 'hono';
import { zValidator } from '@/core/validate';
import * as noteService from './note.service';
import {
    createNoteSchema,
    updateNoteSchema,
    listNotesQuerySchema,
    idParamSchema,
} from '@workspace/shared';

const noteRouter = new Hono();

// GET / — List notes (optionally filtered by taskId)
noteRouter.get('/', zValidator('query', listNotesQuerySchema), async (c) => {
    const query = c.req.valid('query');
    const result = await noteService.listNotes(query);
    return c.json({ success: true, data: result });
});

// GET /:id — Get note with parent task
noteRouter.get('/:id', zValidator('param', idParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    const note = await noteService.getNoteById(id);
    return c.json({ success: true, data: note });
});

// POST / — Create note
noteRouter.post('/', zValidator('json', createNoteSchema), async (c) => {
    const data = c.req.valid('json');
    const note = await noteService.createNote(data);
    return c.json({ success: true, data: note }, 201);
});

// PUT /:id — Update note
noteRouter.put('/:id', zValidator('param', idParamSchema), zValidator('json', updateNoteSchema), async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const note = await noteService.updateNote(id, data);
    return c.json({ success: true, data: note });
});

// DELETE /:id — Delete note
noteRouter.delete('/:id', zValidator('param', idParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    const note = await noteService.deleteNote(id);
    return c.json({ success: true, data: note });
});

export default noteRouter;
