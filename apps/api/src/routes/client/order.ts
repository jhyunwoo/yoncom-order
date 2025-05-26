import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, Variables } from "api/lib/bindings";
import initializeDb from "api/lib/initialize-db";
import * as ClientOrderRequest from "shared/types/requests/client/order";
import * as ClientOrderController from "api/controller/client/order.controller";

const order = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Create Order
order.post("/", zValidator("json", ClientOrderRequest.createValidation), 
  async (c) => {
    const db = initializeDb(c.env.DB);

    const { result, error, status } = 
      await ClientOrderController.create(db, c.req.valid("json"));
    return c.json({ result, error }, status);
  }
);

// Get Order
order.get("/", zValidator("query", ClientOrderRequest.getValidation), 
  async (c) => {
    const db = initializeDb(c.env.DB);

    const { result, error, status } = 
      await ClientOrderController.get(db, c.req.valid("query"));
    return c.json({ result, error }, status);
  }
);

export default order;