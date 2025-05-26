import { Hono } from "hono";
import { Bindings, Variables } from "api/lib/bindings";
import { protectRoute } from "api/middlewares/protect-route";
import * as Schema from "db/schema";
import adminMenu from "./menu";
import adminTable from "./table";
import adminMenuCategory from "./menuCategory";
import adminOrder from "api/routes/admin/order";
import deposit from "api/routes/admin/deposit";

const admin = new Hono<{ Bindings: Bindings; Variables: Variables }>();

admin.use("*", async (c, next) =>
  protectRoute(c, next, [Schema.userRole.ADMIN]),
);

admin.get("/", async (c) => {
  return c.json({ result: "Admin API is Healthy", user: c.get("user") });
});

admin.route("/menu", adminMenu);
admin.route("/table", adminTable);
admin.route("/menuCategory", adminMenuCategory);
admin.route("/order", adminOrder);
admin.route("/deposit", deposit);

export default admin;
