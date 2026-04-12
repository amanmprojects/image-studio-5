import { drizzle } from "drizzle-orm/node-postgres";
import * as authSchema from "@/lib/db/auth-schema";
import { getDsqlPool } from "@/lib/dsql-pool";
import * as appSchema from "@/lib/db/schema";
import "server-only";

const schema = { ...authSchema, ...appSchema };

export const db = drizzle(getDsqlPool(), { schema });
