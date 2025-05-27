import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, Variables } from "api/lib/bindings";
import initializeDb from "api/lib/initialize-db";
import {
  adminCreateMenu,
  adminDeleteMenu,
  adminGetMenu,
  adminGetMenus,
  adminUpdateMenu,
} from "api/controller/admin/menu.controller";
import { ContentfulStatusCode } from "hono/utils/http-status";
import {
  createValidation,
  removeValidation,
  updateValidation,
} from "shared/types/requests/admin/menu";

const adminMenu = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Create Menu
adminMenu.post("/", zValidator("json", createValidation), async (c) => {
  const db = initializeDb(c.env.DB);

  const { result, error, status } = await adminCreateMenu(
    db,
    c.req.valid("json"),
  );
  return c.json({ result, error }, status as ContentfulStatusCode);
});

// Update Menu
adminMenu.put("/", zValidator("json", updateValidation), async (c) => {
  const db = initializeDb(c.env.DB);

  const { result, error, status } = await adminUpdateMenu(
    db,
    c.req.valid("json"),
  );
  return c.json({ result, error }, status as ContentfulStatusCode);
});

// Remove Menu
adminMenu.delete("/", zValidator("json", removeValidation), async (c) => {
  const db = initializeDb(c.env.DB);

  const { result, error, status } = await adminDeleteMenu(
    db,
    c.req.valid("json"),
  );
  return c.json({ result, error }, status as ContentfulStatusCode);
});

adminMenu.get("/", async (c) => {
  const db = initializeDb(c.env.DB);

  const { result, error, status } = await adminGetMenus(db);
  return c.json({ result, error }, status as ContentfulStatusCode);
});

adminMenu.get("/:menuId", async (c) => {
  const { menuId } = c.req.param();
  const db = initializeDb(c.env.DB);
  const { result, error, status } = await adminGetMenu(db, menuId);

  return c.json({ result, error }, status as ContentfulStatusCode);
});
export default adminMenu;
