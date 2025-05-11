import { Hono } from "hono";
import { Bindings, Variables } from "api/lib/bindings";
import { zValidator } from "@hono/zod-validator";
import initializeDb from "api/lib/initialize-db";
import { createOrderValidation, getOrderValidation } from "api/lib/validations";
import * as OrderController from "api/controller/order.controller";

const order = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Create Order
order.post("/", zValidator("json", createOrderValidation), 
  async (c) => {
    const db = initializeDb(c.env.DB);

    const { result, status } = 
      await OrderController.create(db, c.req.valid("json"));
    return c.json({ result }, status);
  }
);

// Get Order
order.get("/", zValidator("json", getOrderValidation), 
  async (c) => {
    const db = initializeDb(c.env.DB);

    const { result, status } = 
      await OrderController.get(db, c.req.valid("json"));
    return c.json({ result }, status);
  }
);

export default order;