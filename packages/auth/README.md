# @workspace/auth

Shared authentication package using [Better Auth](https://better-auth.com) with GitHub OAuth.

## Exports

| Subpath                   | Description                                                      |
| ------------------------- | ---------------------------------------------------------------- |
| `@workspace/auth`         | Server-side `createAuth(db)` factory, schemas, types             |
| `@workspace/auth/client`  | `createAuthClient(baseURL)` for React frontends                  |
| `@workspace/auth/schemas` | Zod schemas: `UserSchema`, `SessionSchema`, `AuthApiErrorSchema` |
| `@workspace/auth/types`   | TypeScript types: `User`, `Session`, `AuthApiError`              |

## Server Usage (apps/api)

```ts
import { createAuth } from '@workspace/auth';
import { db } from './db/drizzle';

export const auth = createAuth(db);
```

Mount in Hono:

```ts
app.on(['GET', 'POST'], '/api/auth/**', (c) => auth.handler(c.req.raw));
```

## Client Usage (apps/web)

```ts
import { createAuthClient } from '@workspace/auth/client';

const authClient = createAuthClient('http://localhost:3000');

// Sign in with GitHub
await authClient.signIn.social({ provider: 'github' });
```

## Environment Variables

| Variable               | Description                      |
| ---------------------- | -------------------------------- |
| `BETTER_AUTH_SECRET`   | Encryption secret (min 32 chars) |
| `BETTER_AUTH_URL`      | Base URL of the API server       |
| `GITHUB_CLIENT_ID`     | GitHub OAuth App client ID       |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret   |
