import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./lib/db/auth-schema.ts", "./lib/db/schema.ts"],
  dialect: "postgresql",
});
