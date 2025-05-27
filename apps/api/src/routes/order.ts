import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, Variables } from "api/lib/bindings";
import initializeDb from "api/lib/initialize-db";
import {
  createValidation,
  removeValidation,
} from "shared/types/requests/client/order";
import {
  createOrder,
  removeOrder,
  getOrder,
  getOrders,
} from "api/controller/order.controller";
import { ContentfulStatusCode } from "hono/utils/http-status";

const order = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Create Order
order.post("/", zValidator("json", createValidation), async (c) => {
  const db = initializeDb(c.env.DB);

  const { result, error, status } = await createOrder(db, c.req.valid("json"));
  return c.json({ result, error }, status);
});

// Get Order
order.get("/:tableId", async (c) => {
  const db = initializeDb(c.env.DB);
  const { tableId } = c.req.param();
  const { result, error, status } = await getOrders(db, tableId);
  return c.json({ result, error }, status as ContentfulStatusCode);
});

order.get("/:tableId/:orderId", async (c) => {
  const db = initializeDb(c.env.DB);

  const { result, error, status } = await getOrder(db, c.req.param());
  return c.json({ result, error }, status as ContentfulStatusCode);
});

order.delete("/", zValidator("json", removeValidation), async (c) => {
  const db = initializeDb(c.env.DB);

  const { result, error, status } = await removeOrder(db, c.req.valid("json"));
  return c.json({ result, error }, status as ContentfulStatusCode);
});

export default order;
