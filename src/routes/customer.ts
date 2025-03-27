import { Hono } from "hono";
import { Bindings, Variables } from "../lib/bindings";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import initializeDb from "../db/initialize-db";
import { and, eq, isNotNull } from "drizzle-orm";
import { tables } from "../db/schema";
import encryptData from "../lib/encrypt-data";
import { setCookie, getCookie } from "hono/cookie";
const customer = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Occupy Table
customer.put(
  "/occupy",
  zValidator("json", z.object({ tableId: z.number().min(1) })),
  async (c) => {
    const { tableId } = c.req.valid("json");
    const db = initializeDb(c.env.DB);

    const customerToken = getCookie(c, "customer_token");

    // Check if table is already occupied
    const table = await db.query.tables.findFirst({
      where: and(eq(tables.id, tableId), isNotNull(tables.customerToken)),
    });

    if (table?.customerToken === customerToken) {
      return c.json({ result: "Table already occupied by you" });
    }

    if (table) {
      return c.json({ result: "Table already occupied" }, 400);
    }

    const currentDate = String(new Date());

    const { encrypted, key, iv } = await encryptData(currentDate);

    try {
      await db
        .update(tables)
        .set({ customerToken: encrypted, tokenIv: iv, tokenKey: key });
    } catch (e) {
      console.error(e);
      return c.json({ result: "DB Error" }, 500);
    }
    setCookie(c, "customer_token", encrypted, { httpOnly: true, secure: true });
    return c.json({ result: "success" });
  },
);

export default customer;
