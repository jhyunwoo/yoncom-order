import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, Variables } from "api/lib/bindings";
import initializeDb from "api/lib/initialize-db";
import * as AdminMenuCategoryController from "api/controller/admin/menuCategory.controller";
import * as AdminMenuCategoryRequest from "types/requests/admin/menuCategory";

const adminMenuCategory = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Create Menu
adminMenuCategory.post("/", zValidator("json", AdminMenuCategoryRequest.createValidation), async (c) => {
  const db = initializeDb(c.env.DB);
  const userId = c.get("user")!.id;

  const { result, error, status } = 
    await AdminMenuCategoryController.create(db, userId, c.req.valid("json"));
  return c.json({ result, error }, status);
});

// Update Menu
adminMenuCategory.put("/", zValidator("json", AdminMenuCategoryRequest.updateValidation), async (c) => {
  const db = initializeDb(c.env.DB);
  const userId = c.get("user")!.id;

  const { result, error, status } = 
    await AdminMenuCategoryController.update(db, userId, c.req.valid("json"));
  return c.json({ result, error }, status);
});

// Remove Menu
adminMenuCategory.delete("/", zValidator("json", AdminMenuCategoryRequest.removeValidation),
  async (c) => {
  const db = initializeDb(c.env.DB);
  const userId = c.get("user")!.id;

  const { result, error, status } = 
    await AdminMenuCategoryController.remove(db, userId, c.req.valid("json"));
  return c.json({ result, error }, status);
});

export default adminMenuCategory;
