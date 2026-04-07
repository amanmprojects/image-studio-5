import { db } from "@/lib/db";
import { betterAuth } from "better-auth";
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
  database: db,
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
