import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import initializeDb from "../db/initialize-db";
import { and, eq, isNotNull } from "drizzle-orm";
import { tables } from "../db/schema";
import encryptData from "../lib/encrypt-data";
import { Hono } from "hono";
import { Bindings, Variables } from "../lib/bindings";
import { setCookie } from "hono/cookie";

const table = new Hono<{ Bindings: Bindings; Variables: Variables }>();

table.put(
  "/occupy",
  zValidator("json", z.object({ tableId: z.string().min(1) })),
  async (c) => {
    const { tableId } = c.req.valid("json");
    const db = initializeDb(c.env.DB);

    // Check if table is already occupied
    const table = await db.query.tables.findFirst({
      where: and(eq(tables.id, tableId), isNotNull(tables.customerToken)),
    });

    const customerToken = c.get("customerToken");
    if (customerToken && table?.customerToken === customerToken) {
      return c.json({ result: "Table already occupied by you" });
    }

    if (table) {
      return c.json({ result: "Table already occupied" }, 400);
    }

    const currentDate = String(new Date()) + tableId;

    const { encrypted, key, iv } = await encryptData(currentDate);

    try {
      const tableData = (
        await db
          .update(tables)
          .set({ customerToken: encrypted, tokenIv: iv, tokenKey: key })
          .returning({ table: tables.name })
      )[0];

      setCookie(c, "customer_token", encrypted, {
        httpOnly: true,
        secure: true,
      });

      return c.json({ result: "success", table: tableData.table });
    } catch (e) {
      console.error(e);
      return c.json({ result: "DB Error" }, 500);
    }
  },
);

export default table;
