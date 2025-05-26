import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, Variables } from "api/lib/bindings";
import initializeDb from "api/lib/initialize-db";
import * as MenuRequest from "shared/api/types/requests/admin/menu";
import * as Menu from "api/controller/menu.controller";
import { getMenus } from "api/controller/menu.controller";
import { ContentfulStatusCode } from "hono/utils/http-status";

const menu = new Hono<{ Bindings: Bindings; Variables: Variables }>();

menu.get("/", async (c) => {
  const db = initializeDb(c.env.DB);

  const { result, error, status } = await getMenus(db);
  return c.json({ result, error }, status as ContentfulStatusCode);
});

export default menu;
