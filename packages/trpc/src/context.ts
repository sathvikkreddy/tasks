import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@workspace/db';

export interface Context {
  db: NodePgDatabase<typeof schema>;
}

export const createContext = () => {
    // This is a placeholder. The actual context is constructed in the app.ts
    // or you can export a helper here if you want.
    return {} as Context; 
};
