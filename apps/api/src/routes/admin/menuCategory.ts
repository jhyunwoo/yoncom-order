import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, Variables } from "api/lib/bindings";
import initializeDb from "api/lib/initialize-db";
import { menuCategories } from "db/schema";
import { eq } from "drizzle-orm";
import {
  createValidation,
  removeValidation,
  updateValidation,
} from "shared/types/requests/admin/menuCategory";

const adminMenuCategory = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

// Create Menu
adminMenuCategory.post("/", zValidator("json", createValidation), async (c) => {
  const db = initializeDb(c.env.DB);
  const { name, description } = c.req.valid("json").menuCategoryOptions;

  try {
    await db
      .insert(menuCategories)
      .values({ name: name, description: description });
    return c.json({ result: "Success" }, 200);
  } catch (e) {
    console.error(e);
    return c.json({ error: "Failed to create menu category" }, 500);
  }
});

// Update Menu Category
adminMenuCategory.put("/", zValidator("json", updateValidation), async (c) => {
  const db = initializeDb(c.env.DB);
  const { menuCategoryId, menuCategoryOptions } = c.req.valid("json");

  try {
    await db
      .update(menuCategories)
      .set({
        name: menuCategoryOptions.name,
        description: menuCategoryOptions.description,
      })
      .where(eq(menuCategories.id, menuCategoryId));
    return c.json({ result: "Success" }, 200);
  } catch (e) {
    console.error(e);
    return c.json({ error: "Failed to update menu category" }, 500);
  }
});

// Remove Menu
adminMenuCategory.delete(
  "/",
  zValidator("json", removeValidation),
  async (c) => {
    const db = initializeDb(c.env.DB);
    const { menuCategoryId } = c.req.valid("json");
    try {
      await db
        .update(menuCategories)
        .set({ deletedAt: new Date().getTime() })
        .where(eq(menuCategories.id, menuCategoryId));
      return c.json({ result: "Success" }, 200);
    } catch (e) {
      console.error(e);
      return c.json({ error: "Failed to remove menu category" }, 500);
    }
  },
);

export default adminMenuCategory;
