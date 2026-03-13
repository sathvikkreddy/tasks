import { router } from './trpc';
import { tasksRouter } from './routers/tasks';
import { notesRouter } from './routers/notes';
import { tagsRouter } from './routers/tags';

export const appRouter = router({
  tasks: tasksRouter,
  notes: notesRouter,
  tags: tagsRouter,
});

export type AppRouter = typeof appRouter;
