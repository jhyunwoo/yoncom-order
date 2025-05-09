import { Hono } from "hono";
import { Bindings, Variables } from "~/lib/bindings";
import { zValidator } from "@hono/zod-validator";
import { createMenuValidation, deleteMenuValidation, updateMenuValidation } from "~/lib/validations";
import initializeDb from "~/db/initialize-db";
import * as Menu from "~/controller/menu.controller";

const adminMenu = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Create Menu
adminMenu.post("/", zValidator("json", createMenuValidation), async (c) => {
  const db = initializeDb(c.env.DB);
  const userId = c.get("user")!.id;

  const { result, status } = 
    await Menu.create(db, userId, c.req.valid("json"));
  return c.json({ result }, status);
});

// Update Menu
adminMenu.put("/", zValidator("json", updateMenuValidation), async (c) => {
  const db = initializeDb(c.env.DB);
  const userId = c.get("user")!.id;

  const { result, status } = 
    await Menu.update(db, userId, c.req.valid("json"));
  return c.json({ result }, status);
});

// Remove Menu
adminMenu.delete("/", zValidator("json", deleteMenuValidation),
  async (c) => {
  const db = initializeDb(c.env.DB);
  const userId = c.get("user")!.id;

  const { result, status } = 
    await Menu.remove(db, userId, c.req.valid("json"));
  return c.json({ result }, status);
});

export default adminMenu;
