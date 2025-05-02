import { Hono } from "hono";
import { Bindings, Variables } from "../../lib/bindings";
import { zValidator } from "@hono/zod-validator";
import { menuPostValidation, menuPutValidation } from "../../lib/validations";
import initializeDb from "../../db/initialize-db";
import { menus } from "../../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const adminMenu = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Create Menu
adminMenu.post("/", zValidator("json", menuPostValidation), async (c) => {
  const { name, description, price, image, quantity, canOrder } =
    c.req.valid("json");

  const db = initializeDb(c.env.DB);

  try {
    await db
      .insert(menus)
      .values({ name, description, price, quantity, canOrder, image });
  } catch (e) {
    console.error(e);
    return c.json({ result: "DB Insert Error" }, 500);
  }
  return c.json({ result: "success" });
});

// Update Menu
adminMenu.put("/", zValidator("json", menuPutValidation), async (c) => {
  const { id, name, description, price, image, quantity, canOrder } =
    c.req.valid("json");

  const db = initializeDb(c.env.DB);

  try {
    const updateResult = await db
      .update(menus)
      .set({ name, description, price, quantity, canOrder, image })
      .where(eq(menus.id, id)).returning({id:menus.id});
    if (updateResult.length === 0) {
      return c.json({result:"Menu Not Found"}, 404);
    }
  } catch (e) {
    console.error(e);
    return c.json({ result: "DB Update Error" }, 500);
  }

  return c.json({ result: "success" });
});

// Delete Menu
adminMenu.delete(
  "/",
  zValidator(
    "json",
    z.object({
      id: z.number().min(1),
    }),
  ),
  async (c) => {
    const { id } = c.req.valid("json");

    const db = initializeDb(c.env.DB);

    try {
      const deleteResult = await db.delete(menus).where(eq(menus.id, id)).returning({
        id:menus.id
      })
      if(deleteResult.length===0){
        return c.json({result:"Menu Not Found"}, 404);
      }
    } catch (e) {
      console.error(e);
      return c.json({ result: "DB Delete Error" }, 500);
    }
    return c.json({ result: "success" });
  },
);

export default adminMenu;
