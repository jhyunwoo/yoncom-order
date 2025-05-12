import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, Variables } from "api/lib/bindings";
import initializeDb from "api/lib/initialize-db";
import * as Menu from "api/controller/menu.controller";
import * as MenuRequest from "shared/api/types/requests/menu";

const adminMenu = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Create Menu
adminMenu.post("/", zValidator("json", MenuRequest.createValidation), async (c) => {
  const db = initializeDb(c.env.DB);
  const userId = c.get("user")!.id;

  const { result, error, status } = 
    await Menu.create(db, userId, c.req.valid("json"));
  return c.json({ result, error }, status);
});

// Update Menu
adminMenu.put("/", zValidator("json", MenuRequest.updateValidation), async (c) => {
  const db = initializeDb(c.env.DB);
  const userId = c.get("user")!.id;

  const { result, error, status } = 
    await Menu.update(db, userId, c.req.valid("json"));
  return c.json({ result, error }, status);
});

// Remove Menu
adminMenu.delete("/", zValidator("json", MenuRequest.removeValidation),
  async (c) => {
  const db = initializeDb(c.env.DB);
  const userId = c.get("user")!.id;

  const { result, error, status } = 
    await Menu.remove(db, userId, c.req.valid("json"));
  return c.json({ result, error }, status);
});

adminMenu.get("/", zValidator("json", MenuRequest.adminGetValidation), async (c) => {
  const db = initializeDb(c.env.DB);
  const userId = c.get("user")!.id;

  const { result, error, status } =
    await Menu.adminGet(db, userId, c.req.valid("json"));
  return c.json({ result, error }, status);
});
export default adminMenu;
