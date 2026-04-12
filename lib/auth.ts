import { db } from "@/lib/db/drizzle";
import * as authSchema from "@/lib/db/auth-schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import "server-only";

const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const useSecureCookiesOverride = process.env.BETTER_AUTH_USE_SECURE_COOKIES;
const useSecureCookies =
  useSecureCookiesOverride === "true"
    ? true
    : useSecureCookiesOverride === "false"
      ? false
      : (process.env.BETTER_AUTH_URL?.startsWith("https://") ?? process.env.NODE_ENV === "production");

export const auth = betterAuth({
  appName: "Image Studio",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
    transaction: false,
  }),
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    useSecureCookies,
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
