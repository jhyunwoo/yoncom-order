import { Hono } from "hono";
import { Bindings, Variables } from "api/lib/bindings";
// import deposit from "./deposit";
// import image from "./image";
import adminMenu from "./menu";
// import adminOrder from "./order";
// import adminRole from "./role";
import adminTable from "./table";
import adminMenuCategory from "./menuCategory";
import { protectRoute } from "api/middlewares/protect-route";
// import pos from "./pos";
import * as Schema from "db/schema";

const admin = new Hono<{ Bindings: Bindings; Variables: Variables }>();

admin.use("*", async (c, next) => protectRoute(c, next, [Schema.userRole.ADMIN]));

admin.get("/", async (c) => {
  return c.json({ result: "Admin API is Healthy", user: c.get("user") });
});

// admin.route("/deposit", deposit);
// admin.route("/image", image);
admin.route("/menu", adminMenu);
// admin.route("/order", adminOrder);
// admin.route("/role", adminRole);
admin.route("/table", adminTable);
admin.route("/menuCategory", adminMenuCategory);
// admin.route("/pos", pos);

export default admin;
