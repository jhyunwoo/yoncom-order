import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export default function initializeDb(env: D1Database) {
  return drizzle(env, { schema: schema });
}
