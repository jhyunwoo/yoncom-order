import { Hono } from "hono";
import { Bindings, Variables } from "api/lib/bindings";
import initializeDb from "api/lib/initialize-db";
import { getMenus } from "api/controller/menu.controller";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { zValidator } from "@hono/zod-validator";
import * as ClientMenuRequest from "shared/types/requests/client/menu";

const menu = new Hono<{ Bindings: Bindings; Variables: Variables }>();

menu.get("/", zValidator("query", ClientMenuRequest.getValidation), async (c) => {
  const db = initializeDb(c.env.DB);

  const { result, error, status } = await getMenus(db, c.req.valid("query"));
  return c.json({ result, error }, status as ContentfulStatusCode);
});

export default menu;
