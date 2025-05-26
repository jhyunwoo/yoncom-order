import { Hono } from "hono";
import { Bindings, Variables } from "api/lib/bindings";
import { protectRoute } from "api/middlewares/protect-route";
import * as Schema from "db/schema";
import adminMenu from "./menu";
import adminTable from "./table";
import adminMenuCategory from "./menuCategory";
import adminDeposit from "./deposit";

import { zValidator } from "@hono/zod-validator";
import * as AdminRequest from "shared/types/requests/client/admin";
import * as AdminResponse from "shared/types/responses/client/admin";

const admin = new Hono<{ Bindings: Bindings; Variables: Variables }>();

admin.use("*", async (c, next) => protectRoute(c, next, [Schema.userRole.ADMIN]));

admin.get("/", zValidator("query", AdminRequest.heartBeatValidation), async (c) => {
  const res: AdminResponse.HeartBeat = {
    result: "Admin API is Healthy",
    user: c.get("user"),
  };
  return c.json(res);
});

admin.route("/menu", adminMenu);
admin.route("/table", adminTable);
admin.route("/menuCategory", adminMenuCategory);
admin.route("/deposit", adminDeposit);

export default admin;
