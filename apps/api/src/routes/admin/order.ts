import { Hono } from "hono";
import { Bindings, Variables } from "api/lib/bindings";
import { zValidator } from "@hono/zod-validator";
import {
  deleteValidation,
  paidValidation,
} from "shared/api/types/requests/order";
import initializeDb from "api/lib/initialize-db";
import { deleteOrder } from "api/controller/admin/order.controller";
import { ContentfulStatusCode } from "hono/dist/types/utils/http-status";
import { payments } from "db/schema";
import { eq } from "drizzle-orm";

const adminOrder = new Hono<{ Bindings: Bindings; Variables: Variables }>();

adminOrder.delete("/", zValidator("json", deleteValidation), async (c) => {
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

export default adminOrder;
