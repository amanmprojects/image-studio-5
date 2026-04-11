import { AuroraDSQLPool } from "@aws/aurora-dsql-node-postgres-connector";
import { isNextProductionBuild } from "@/lib/is-build-phase";
import "server-only";

let pool: AuroraDSQLPool | null = null;

function resolveClusterHost(): string {
  const fromEnv = process.env.AURORA_DSQL_HOST?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  if (isNextProductionBuild()) {
    // `next build` imports server modules; a real host is not required until runtime.
    return "placeholder.dsql.us-east-1.on.aws";
  }
  throw new Error(
    "AURORA_DSQL_HOST is not set. Configure your Aurora DSQL cluster endpoint."
  );
}

export function getDsqlPool(): AuroraDSQLPool {
  if (!pool) {
    const host = resolveClusterHost();
    const user = process.env.AURORA_DSQL_USER?.trim() || "admin";

    pool = new AuroraDSQLPool({
      host,
      user,
      database: process.env.AURORA_DSQL_DATABASE?.trim(),
      region: process.env.AURORA_DSQL_REGION?.trim(),
      max: Number(process.env.AURORA_DSQL_POOL_MAX ?? 3),
      idleTimeoutMillis: 60_000,
    });
  }

  return pool;
}
