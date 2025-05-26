import { Hono } from "hono";
import { Bindings, Variables } from "api/lib/bindings";
import { zValidator } from "@hono/zod-validator";
import { deleteValidation } from "shared/api/types/requests/order";
import initializeDb from "api/lib/initialize-db";
import { createValidation } from "shared/api/types/requests/admin/order";
import {
  createOrder,
  deleteOrder,
} from "api/controller/admin/order.controller";
import { ContentfulStatusCode } from "hono/dist/types/utils/http-status";

const adminOrder = new Hono<{ Bindings: Bindings; Variables: Variables }>();

adminOrder.post("/", zValidator("json", createValidation), async (c) => {
  const data = c.req.valid("json");
  const db = initializeDb(c.env.DB);

  // Call the createOrder function from the controller
  const result = await createOrder(db, data);

  if (result.error) {
    return c.json(
      { error: result.error },
      result.status as ContentfulStatusCode,
    );
  }

  return c.json({ result: result.result }, 201);
});

adminOrder.delete("/", zValidator("json", deleteValidation), async (c) => {
  const { orderId } = c.req.valid("json");
  const db = initializeDb(c.env.DB);

  const { result, error, status } = await deleteOrder(db, orderId);
  return c.json({ result, error }, status as ContentfulStatusCode);
});

export default adminOrder;
