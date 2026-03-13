import { createAuthClient as createBetterAuthClient } from 'better-auth/react';

/**
 * Creates a typed Better Auth client for use in React frontends.
 *
 * @param baseURL - The base URL of the API server (e.g. "http://localhost:3000")
 */
export const createAuthClient = (baseURL: string) => {
    return createBetterAuthClient({
        baseURL,
    });
};

/** The type of the auth client returned by `createAuthClient` */
export type AuthClient = ReturnType<typeof createAuthClient>;
