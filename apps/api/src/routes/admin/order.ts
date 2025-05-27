import { Hono } from "hono";
import { Bindings, Variables } from "api/lib/bindings";
import { zValidator } from "@hono/zod-validator";
import {
  removeValidation,
  paidValidation,
  completeValidation,
} from "shared/types/requests/admin/order";
import initializeDb from "api/lib/initialize-db";
import { deleteOrder } from "api/controller/admin/order.controller";
import { ContentfulStatusCode } from "hono/dist/types/utils/http-status";
import { menuOrders, payments } from "db/schema";
import { eq } from "drizzle-orm";

const adminOrder = new Hono<{ Bindings: Bindings; Variables: Variables }>();

adminOrder.delete("/", zValidator("json", removeValidation), async (c) => {
  const { orderId } = c.req.valid("json");
  const db = initializeDb(c.env.DB);

  const { result, error, status } = await deleteOrder(db, orderId);
  return c.json({ result, error }, status as ContentfulStatusCode);
});

adminOrder.put("/", zValidator("json", paidValidation), async (c) => {
  const { orderId } = c.req.valid("json");
  const db = initializeDb(c.env.DB);

  // Assuming you have a function to mark an order as paid
  try {
    await db
      .update(payments)
      .set({ paid: true })
      .where(eq(payments.orderId, orderId));
    return c.json({ result: "Order marked as paid" }, 200);
  } catch (e) {
    return c.json({ error: "Failed to mark order as paid" }, 500);
  }
});

adminOrder.put(
  "/complete",
  zValidator("json", completeValidation),
  async (c) => {
    const { menuOrderId } = c.req.valid("json");
    const db = initializeDb(c.env.DB);

    try {
      await db
        .update(menuOrders)
        .set({ status: "SERVED" })
        .where(eq(menuOrders.id, menuOrderId));
    } catch (e) {
      return c.json({ error: "Failed to complete menu order" }, 500);
    }
    return c.json({ result: "Success" });
  },
);

adminOrder.put("/cancel", zValidator("json", completeValidation), async (c) => {
  const { menuOrderId } = c.req.valid("json");
  const db = initializeDb(c.env.DB);

  try {
    await db
      .update(menuOrders)
      .set({ status: "CANCELLED" })
      .where(eq(menuOrders.id, menuOrderId));
  } catch (e) {
    return c.json({ error: "Failed to cancel menu order" }, 500);
  }
  return c.json({ result: completeValidation });
});

export default adminOrder;
