import { Hono } from 'hono';
import { zValidator } from '@/core/validate';
import * as taskService from './task.service';
import {
    createTaskSchema,
    updateTaskSchema,
    idParamSchema,
    listTasksQuerySchema,
    taskTagsBodySchema,
} from '@workspace/shared';

const taskRouter = new Hono();

// GET / — List tasks (paginated, filterable, searchable)
taskRouter.get('/', zValidator('query', listTasksQuerySchema), async (c) => {
    const query = c.req.valid('query');
    const result = await taskService.listTasks(query);
    return c.json({ success: true, data: result });
});

// GET /:id — Get task with notes + tags
taskRouter.get('/:id', zValidator('param', idParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    const task = await taskService.getTaskById(id);
    return c.json({ success: true, data: task });
});

// POST / — Create task
taskRouter.post('/', zValidator('json', createTaskSchema), async (c) => {
    const data = c.req.valid('json');
    const task = await taskService.createTask(data);
    return c.json({ success: true, data: task }, 201);
});

// PUT /:id — Update task
taskRouter.put('/:id', zValidator('param', idParamSchema), zValidator('json', updateTaskSchema), async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const task = await taskService.updateTask(id, data);
    return c.json({ success: true, data: task });
});

// DELETE /:id — Delete task
taskRouter.delete('/:id', zValidator('param', idParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    const task = await taskService.deleteTask(id);
    return c.json({ success: true, data: task });
});

// POST /:id/tags/add — Add tags to task
taskRouter.post('/:id/tags/add', zValidator('param', idParamSchema), zValidator('json', taskTagsBodySchema), async (c) => {
    const { id } = c.req.valid('param');
    const { tagIds } = c.req.valid('json');
    const task = await taskService.addTagsToTask(id, tagIds);
    return c.json({ success: true, data: task });
});

// POST /:id/tags/remove — Remove tags from task
taskRouter.post('/:id/tags/remove', zValidator('param', idParamSchema), zValidator('json', taskTagsBodySchema), async (c) => {
    const { id } = c.req.valid('param');
    const { tagIds } = c.req.valid('json');
    const task = await taskService.removeTagsFromTask(id, tagIds);
    return c.json({ success: true, data: task });
});

export default taskRouter;
