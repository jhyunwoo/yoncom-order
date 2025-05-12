import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, Variables } from "api/lib/bindings";
import initializeDb from "api/lib/initialize-db";
import * as OrderRequest from "shared/api/types/requests/order";
import * as OrderController from "api/controller/order.controller";

const order = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Create Order
order.post("/", zValidator("json", OrderRequest.createValidation), 
  async (c) => {
    const db = initializeDb(c.env.DB);

    const { result, error, status } = 
      await OrderController.create(db, c.req.valid("json"));
    return c.json({ result, error }, status);
  }
);

// Get Order
order.get("/", zValidator("json", OrderRequest.getValidation), 
  async (c) => {
    const db = initializeDb(c.env.DB);

    const { result, error, status } = 
      await OrderController.get(db, c.req.valid("json"));
    return c.json({ result, error }, status);
  }
);

export default order;