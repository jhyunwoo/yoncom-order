import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, Variables } from "api/lib/bindings";
import initializeDb from "api/lib/initialize-db";
import * as MenuCategoryController from "api/controller/menuCategory.controller";
import * as MenuCategoryRequest from "shared/api/types/requests/menuCategory";

const adminMenuCategory = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Create Menu
adminMenuCategory.post("/", zValidator("json", MenuCategoryRequest.createValidation), async (c) => {
  const db = initializeDb(c.env.DB);
  const userId = c.get("user")!.id;

  const { result, error, status } = 
    await MenuCategoryController.create(db, userId, c.req.valid("json"));
  return c.json({ result, error }, status);
});

// Update Menu
adminMenuCategory.put("/", zValidator("json", MenuCategoryRequest.updateValidation), async (c) => {
  const db = initializeDb(c.env.DB);
  const userId = c.get("user")!.id;

  const { result, error, status } = 
    await MenuCategoryController.update(db, userId, c.req.valid("json"));
  return c.json({ result, error }, status);
});

// Remove Menu
adminMenuCategory.delete("/", zValidator("json", MenuCategoryRequest.removeValidation),
  async (c) => {
  const db = initializeDb(c.env.DB);
  const userId = c.get("user")!.id;

  const { result, error, status } = 
    await MenuCategoryController.remove(db, userId, c.req.valid("json"));
  return c.json({ result, error }, status);
});

export default adminMenuCategory;
