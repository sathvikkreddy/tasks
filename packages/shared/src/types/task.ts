export const taskStatusValues = ['todo', 'in_progress', 'done'] as const;
export type TaskStatus = (typeof taskStatusValues)[number];
