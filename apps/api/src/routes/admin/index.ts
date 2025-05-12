import { Hono } from "hono";
import { Bindings, Variables } from "api/lib/bindings";
import { protectRoute } from "api/middlewares/protect-route";
import * as Schema from "db/schema";
import adminMenu from "./menu";
import adminTable from "./table";
import adminMenuCategory from "./menuCategory";
import * as AdminResponse from "shared/api/types/responses/admin";

const admin = new Hono<{ Bindings: Bindings; Variables: Variables }>();

admin.use("*", async (c, next) => protectRoute(c, next, [Schema.userRole.ADMIN]));

admin.get("/", async (c) => {
  return c.json({ result: "Admin API is Healthy", user: c.get("user") });
});

admin.route("/menu", adminMenu);
admin.route("/table", adminTable);
admin.route("/menuCategory", adminMenuCategory);

export default admin;
