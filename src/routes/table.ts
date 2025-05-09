import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import initializeDb from "../db/initialize-db";
import { eq, isNull } from "drizzle-orm";
import { tableContexts, tables } from "../db/schema";
import { Hono } from "hono";
import { Bindings, Variables } from "../lib/bindings";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { ContentfulStatusCode } from "hono/utils/http-status";

const table = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const occupyTable = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; }, 
  tableId: string
): Promise<{ result: string; status: ContentfulStatusCode }> => {
  { // Check if table is already occupied
    const table = await db.query.tables.findFirst({
      where: eq(tables.id, tableId),
      with: { 
        tableContexts: {
          where: isNull(tableContexts.deletedAt),
          limit: 1,
        },
      },
    });
    if (!table) 
      return { result: "Table not found", status: 400 };
    if (table.tableContexts.length === 0) 
      return { result: "Table already occupied", status: 400 };
  }

  try {
    await db
      .insert(tableContexts)
      .values({ tableId })
    return { result: "success", status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Error", status: 500 };
  }
}

table.put("/occupy", zValidator("json", z.object({ tableId: z.string().nonempty() })),
  async (c) => {
    const { tableId } = c.req.valid("json");
    const db = initializeDb(c.env.DB);

    const { result, status } = await occupyTable(db, tableId);
    return c.json({ result }, status);
  },
);

export default table;
