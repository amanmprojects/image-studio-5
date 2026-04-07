import { auth } from "@/lib/auth";
import { ensureAppTables } from "@/lib/db";
import "server-only";

let bootstrapPromise: Promise<void> | null = null;

export function bootstrapApp() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const context = await auth.$context;
      await context.runMigrations();
      await ensureAppTables();
    })();
  }

  return bootstrapPromise;
}
