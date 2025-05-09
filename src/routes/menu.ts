import { Hono } from "hono";
import { Bindings, Variables } from "../lib/bindings";
import initializeDb from "../db/initialize-db";
import { zValidator } from "@hono/zod-validator";
import { getMenuValidation } from "~/lib/validations";
import * as Menu from "~/controller/menu.controller";

const menu = new Hono<{ Bindings: Bindings; Variables: Variables }>();

menu.get("/", zValidator("json", getMenuValidation), async (c) => {
  const db = initializeDb(c.env.DB);

  const { result, status } = 
    await Menu.get(db, c.req.valid("json"));
  return c.json({ result }, status);
});

export default menu
