import { Hono } from "hono";
import { Bindings, Variables } from "api/lib/bindings";
import { zValidator } from "@hono/zod-validator";
import { createMenuCategoryValidation, deleteMenuCategoryValidation, updateMenuCategoryValidation } from "api/lib/validations";
import initializeDb from "api/lib/initialize-db";
import * as MenuCategoryController from "api/controller/menuCategory.controller";

const adminMenuCategory = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Create Menu
adminMenuCategory.post("/", zValidator("json", createMenuCategoryValidation), async (c) => {
  const db = initializeDb(c.env.DB);
  const userId = c.get("user")!.id;

  const { result, status } = 
    await MenuCategoryController.create(db, userId, c.req.valid("json"));
  return c.json({ result }, status);
});

// Update Menu
adminMenuCategory.put("/", zValidator("json", updateMenuCategoryValidation), async (c) => {
  const db = initializeDb(c.env.DB);
  const userId = c.get("user")!.id;

  const { result, status } = 
    await MenuCategoryController.update(db, userId, c.req.valid("json"));
  return c.json({ result }, status);
});

// Remove Menu
adminMenuCategory.delete("/", zValidator("json", deleteMenuCategoryValidation),
  async (c) => {
  const db = initializeDb(c.env.DB);
  const userId = c.get("user")!.id;

  const { result, status } = 
    await MenuCategoryController.remove(db, userId, c.req.valid("json"));
  return c.json({ result }, status);
});

export default adminMenuCategory;
