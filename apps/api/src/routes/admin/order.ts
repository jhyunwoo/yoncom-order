import { Hono } from "hono";
import { Bindings, Variables } from "api/lib/bindings";
import { zValidator } from "@hono/zod-validator";
import { deleteValidation } from "shared/api/types/requests/order";
import initializeDb from "api/lib/initialize-db";
import { deleteOrder } from "api/controller/admin/order.controller";
import { ContentfulStatusCode } from "hono/dist/types/utils/http-status";

const adminOrder = new Hono<{ Bindings: Bindings; Variables: Variables }>();

adminOrder.delete("/", zValidator("json", deleteValidation), async (c) => {
  const { orderId } = c.req.valid("json");
  const db = initializeDb(c.env.DB);

  const { result, error, status } = await deleteOrder(db, orderId);
  return c.json({ result, error }, status as ContentfulStatusCode);
});

export default adminOrder;
