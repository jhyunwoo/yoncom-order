import { Hono } from "hono";
import { Bindings, Variables } from "../lib/bindings";
import { zValidator } from "@hono/zod-validator";
import { tableValidation } from "../lib/validations";
import { protectRoute } from "../middlewares/protect-route";
import initializeDb from "../db/initialize-db";
import { tables } from "../db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

const table = new Hono<{ Bindings: Bindings; Variables: Variables }>();

table.use("*", async (c, next) => protectRoute(c, next, ["admin"]));

table.post("/", zValidator("json", tableValidation), async (c) => {
  const { name } = c.req.valid("json");
  const db = initializeDb(c.env.DB);

  try {
    await db.insert(tables).values({ name });
  } catch (e) {
    console.error(e);
    return c.json({ result: "DB Insert Error" }, 500);
  }
  return c.json({ result: "success" });
});

table.delete(
  "/",
  zValidator("json", z.object({ tableId: z.string().min(1) })),
  async (c) => {
    const { tableId } = c.req.valid("json");
    const db = initializeDb(c.env.DB);
    try {
      await db.delete(tables).where(eq(tables.id, tableId));
    } catch (e) {
      console.error(e);
      return c.json({ result: "DB Error" }, 500);
    }
    return c.json({ result: "success" });
  },
);

table.put(
  "/vacate",
  zValidator("json", z.object({ tableId: z.string().min(1) })),
  async (c) => {
    const { tableId } = c.req.valid("json");
    const db = initializeDb(c.env.DB);

    try {
      await db
        .update(tables)
        .set({ customerToken: null, tokenIv: null, tokenKey: null })
        .where(eq(tables.id, tableId));
    } catch (e) {
      console.error(e);
      return c.json({ result: "DB Error" }, 500);
    }
    return c.json({ result: "success" });
  },
);

export default table;
