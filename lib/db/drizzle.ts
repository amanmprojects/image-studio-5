import { drizzle } from "drizzle-orm/node-postgres";
import { getDsqlPool } from "@/lib/dsql-pool";
import * as schema from "@/lib/db/schema";
import "server-only";

export const db = drizzle(getDsqlPool(), { schema });
