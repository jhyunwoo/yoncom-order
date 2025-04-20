import { Hono } from "hono";
import { Bindings, Variables } from "../../lib/bindings";
import { zValidator } from "@hono/zod-validator";
import { orderValidation } from "../../lib/validations";
import initializeDb from "../../db/initialize-db";
import { orders, tables } from "../../db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

const adminOrder = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Create Order
adminOrder.post("/", zValidator("json", orderValidation), async (c) => {
  const { tableId, menuId, quantity, isCompleted } = c.req.valid("json");

  const db = initializeDb(c.env.DB);

  try {
    const table = await db.query.tables.findFirst({
      where: eq(tables.id, tableId),
      columns: {
        customerToken: true,
      },
    });
    if (!table?.customerToken) {
      return c.json({ result: "Table not found" }, 404);
    }
    await db.insert(orders).values({
      tableId,
      menuId,
      quantity,
      isCompleted,
      customerToken: table.customerToken,
    });
  } catch (e) {
    console.error(e);
    return c.json({ result: "DB Insert Error" }, 500);
  }

  return c.json({ result: "success" });
});

// Delete Order
adminOrder.delete(
  "/",
  zValidator(
    "json",
    z.object({
      orderId: z.string().min(1),
    }),
  ),
  async (c) => {
    const { orderId } = c.req.valid("json");
    const db = initializeDb(c.env.DB);

    try {
      await db.delete(orders).where(eq(orders.id, orderId));
    } catch (e) {
      console.error(e);
      return c.json({ result: "DB Delete Error" }, 500);
    }

    return c.json({ result: "success" });
  },
);

export default adminOrder;
