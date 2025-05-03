import { Hono } from "hono";
import { Bindings, Variables } from "../../lib/bindings";
import deposit from "./deposit";
import image from "./image";
import adminMenu from "./menu";
import adminOrder from "./order";
import adminRole from "./role";
import adminTable from "./table";
import { protectRoute } from "../../middlewares/protect-route";
import pos from "./pos";

const admin = new Hono<{ Bindings: Bindings; Variables: Variables }>();

admin.use("*", async (c, next) => protectRoute(c, next, ["admin"]));

admin.route("/deposit", deposit);
admin.route("/image", image);
admin.route("/menu", adminMenu);
admin.route("/order", adminOrder);
admin.route("/role", adminRole);
admin.route("/table", adminTable);
admin.route("/pos", pos);

export default admin;
