import { Hono } from 'hono';
import { zValidator } from '@/core/validate';
import * as tagService from './tag.service';
import {
    createTagSchema,
    updateTagSchema,
    idParamSchema,
    listTagsQuerySchema,
} from '@workspace/shared';

const tagRouter = new Hono();

// GET / — List tags
tagRouter.get('/', zValidator('query', listTagsQuerySchema), async (c) => {
    const query = c.req.valid('query');
    const result = await tagService.listTags(query);
    return c.json({ success: true, data: result });
});

// GET /:id — Get tag with associated tasks
tagRouter.get('/:id', zValidator('param', idParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    const tag = await tagService.getTagById(id);
    return c.json({ success: true, data: tag });
});

// POST / — Create tag
tagRouter.post('/', zValidator('json', createTagSchema), async (c) => {
    const data = c.req.valid('json');
    const tag = await tagService.createTag(data);
    return c.json({ success: true, data: tag }, 201);
});

// PUT /:id — Update tag
tagRouter.put('/:id', zValidator('param', idParamSchema), zValidator('json', updateTagSchema), async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const tag = await tagService.updateTag(id, data);
    return c.json({ success: true, data: tag });
});

// DELETE /:id — Delete tag
tagRouter.delete('/:id', zValidator('param', idParamSchema), async (c) => {
    const { id } = c.req.valid('param');
    const tag = await tagService.deleteTag(id);
    return c.json({ success: true, data: tag });
});

export default tagRouter;
