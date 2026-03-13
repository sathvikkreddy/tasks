import { createAuth } from '@workspace/auth';
import { db } from '@/db/drizzle';

/** Auth instance for the API — used for handler mounting and session validation */
export const auth = createAuth(db);
