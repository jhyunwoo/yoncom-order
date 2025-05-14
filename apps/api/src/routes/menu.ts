import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, Variables } from "api/lib/bindings";
import initializeDb from "api/lib/initialize-db";
import * as MenuRequest from "shared/api/types/requests/menu";
import * as Menu from "api/controller/menu.controller";

const menu = new Hono<{ Bindings: Bindings; Variables: Variables }>();

menu.get("/", zValidator("query", MenuRequest.clientGetValidation), async (c) => {
  const db = initializeDb(c.env.DB);

  const { result, error, status } = 
    await Menu.clientGet(db, c.req.valid("query"));
  return c.json({ result, error }, status);
});

export default menu
