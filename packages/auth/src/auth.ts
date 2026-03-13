import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

/**
 * Creates a Better Auth instance configured with GitHub OAuth
 * and the Drizzle adapter for PostgreSQL.
 *
 * @param db - A Drizzle ORM database instance (node-postgres)
 */
export const createAuth = (db: NodePgDatabase<Record<string, unknown>>) => {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    socialProviders: {
      github: {
        clientId: process.env["GITHUB_CLIENT_ID"] as string,
        clientSecret: process.env["GITHUB_CLIENT_SECRET"] as string,
      },
    },
    secret: process.env["BETTER_AUTH_SECRET"] as string,
    baseURL: process.env["BETTER_AUTH_URL"] as string,
    basePath: "/api/auth",
  });
};
