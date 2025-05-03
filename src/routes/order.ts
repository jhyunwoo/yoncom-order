import { Hono } from "hono";
import { Bindings, Variables } from "../lib/bindings";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import initializeDb from "../db/initialize-db";
import { eq } from "drizzle-orm";
import { menus, orders, tables } from "../db/schema";
import decryptData from "../lib/decrypt-data";

const order = new Hono<{ Bindings: Bindings; Variables: Variables }>();

order.get("/", async (c) => {
  const db = initializeDb(c.env.DB);
  const customerToken = c.get("customerToken");
  console.log(customerToken);
  if (!customerToken) return c.json({ error: "Unauthorized" }, 403);

  const orderData = await db.query.orders.findMany({
    where: eq(orders.customerToken, customerToken),
  });

  return c.json(orderData);
});

order.post(
  "/",
  zValidator(
    "json",
    z.object({
      tableId: z.string().min(1),
      menuId: z.number().min(1),
      quantity: z.number().min(1),
    }),
  ),
  async (c) => {
    const { tableId, menuId, quantity } = c.req.valid("json");
    const db = initializeDb(c.env.DB);
    const customerToken = c.get("customerToken");

    // Check Customer has table
    if (!customerToken) {
      return c.json({ result: "No Table" });
    }

    const checkTable = await db.query.tables.findFirst({
      where: eq(tables.customerToken, customerToken),
    });

    if (!checkTable || !checkTable.tokenKey || !checkTable.tokenIv) {
      return c.json({ result: "No Table" });
    }

    // Validate orders token
    if (
      new Date(
        await decryptData(
          customerToken,
          checkTable.tokenKey,
          checkTable.tokenIv,
        ),
      ) > new Date()
    ) {
      return c.json({ result: "Error" });
    }

    // Check menu quantity is enough
    const menuQuantity = await db.query.menus.findFirst({
      where: eq(menus.id, menuId),
      columns: {
        quantity: true,
      },
    });

    if (!menuQuantity) {
      return c.json({ result: "Menu not found" }, 404);
    }

    const prevOrders = await db.query.orders.findMany({
      where: eq(orders.menuId, menuId),
      columns: {
        quantity: true,
      },
    });

    const orderedQuantity = prevOrders.reduce((acc, order) => {
      return acc + order.quantity;
    }, 0);

    if (menuQuantity.quantity - orderedQuantity < quantity) {
      return c.json({ result: "Not enough menu quantity" }, 400);
    }

    await db
      .insert(orders)
      .values({ tableId, menuId, quantity, customerToken });
    return c.json({ result: "success" });
  },
);

export default order;
