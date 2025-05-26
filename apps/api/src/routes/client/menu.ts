import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, Variables } from "api/lib/bindings";
import initializeDb from "api/lib/initialize-db";
import * as ClientMenuRequest from "shared/types/requests/client/menu";
import * as ClientMenuController from "api/controller/client/menu.controller";

const menu = new Hono<{ Bindings: Bindings; Variables: Variables }>();

menu.get("/", zValidator("query", ClientMenuRequest.getValidation), async (c) => {
  const db = initializeDb(c.env.DB);

  const { result, error, status } = 
    await ClientMenuController.get(db, c.req.valid("query"));
  return c.json({ result, error }, status);
});

export default menu
