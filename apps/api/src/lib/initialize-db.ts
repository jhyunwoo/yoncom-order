import { drizzle } from "drizzle-orm/d1";
import * as schema from "db/schema";

export default function initializeDb(env: D1Database) {
  return drizzle(env, { schema: schema });
}
