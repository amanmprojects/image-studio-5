import { auth } from "@/lib/auth";
import { runAppMigrations } from "@/lib/db";
import { isNextProductionBuild } from "@/lib/is-build-phase";
import "server-only";

let bootstrapPromise: Promise<void> | null = null;

export function bootstrapApp() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      if (isNextProductionBuild()) {
        return;
      }
      const context = await auth.$context;
      await context.runMigrations();
      await runAppMigrations();
    })();
  }

  return bootstrapPromise;
}
