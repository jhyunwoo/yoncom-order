import { Hono } from "hono";
import { Bindings, Variables } from "api/lib/bindings";
import initializeDb from "api/lib/initialize-db";
import { zValidator } from "@hono/zod-validator";
import { getMenuValidation } from "api/lib/validations";
import * as Menu from "api/controller/menu.controller";

const menu = new Hono<{ Bindings: Bindings; Variables: Variables }>();

menu.get("/", zValidator("json", getMenuValidation), async (c) => {
  const db = initializeDb(c.env.DB);

  const { result, status } = 
    await Menu.clientGet(db, c.req.valid("json"));
  return c.json({ result }, status);
});

export default menu
