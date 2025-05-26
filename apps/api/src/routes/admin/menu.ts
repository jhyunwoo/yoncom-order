import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, Variables } from "api/lib/bindings";
import initializeDb from "api/lib/initialize-db";
import * as AdminMenuController from "api/controller/admin/menu.controller";
import * as AdminMenuRequest from "shared/types/requests/admin/menu";

const adminMenu = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Create Menu
adminMenu.post("/", zValidator("json", AdminMenuRequest.createValidation), async (c) => {
  const db = initializeDb(c.env.DB);
  const userId = c.get("user")!.id;

  const { result, error, status } = 
    await AdminMenuController.create(db, userId, c.req.valid("json"));
  return c.json({ result, error }, status);
});

// Update Menu
adminMenu.put("/", zValidator("json", AdminMenuRequest.updateValidation), async (c) => {
  const db = initializeDb(c.env.DB);
  const userId = c.get("user")!.id;

  const { result, error, status } = 
    await AdminMenuController.update(db, userId, c.req.valid("json"));
  return c.json({ result, error }, status);
});

// Remove Menu
adminMenu.delete("/", zValidator("json", AdminMenuRequest.removeValidation),
  async (c) => {
  const db = initializeDb(c.env.DB);
  const userId = c.get("user")!.id;

  const { result, error, status } = 
    await AdminMenuController.remove(db, userId, c.req.valid("json"));
  return c.json({ result, error }, status);
});

adminMenu.get("/", zValidator("query", AdminMenuRequest.getValidation), async (c) => {
  const db = initializeDb(c.env.DB);
  const userId = c.get("user")!.id;

  const { result, error, status } =
    await AdminMenuController.get(db, userId, c.req.valid("query"));
  return c.json({ result, error }, status);
});
export default adminMenu;
