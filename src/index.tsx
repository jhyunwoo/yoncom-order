import { Hono } from "hono";
import { Bindings, Variables } from "./lib/bindings";
import { authProvider } from "./middlewares/auth-provider";
import { protectRoute } from "./middlewares/protect-route";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import auth from "./routes/admin/auth";
import deposit from "./routes/admin/deposit";
import image from "./routes/admin/image";
import adminMenu from "./routes/admin/menu";
import adminOrder from "./routes/admin/order";
import adminRole from "./routes/admin/role";
import adminTable from "./routes/admin/table";
import menu from "./routes/admin/menu";
import order from "./routes/order";
import table from "./routes/table";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middlewares
app.use(logger());
app.use(authProvider);
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://example.org"],
  }),
);

// Route 보호
app.use("/role/*", async (c, next) => protectRoute(c, next, ["role"]));
// 서버 정상 작동 확인용 API
const serverStartDate = new Date();

app.get("/", (c) => {
  return c.json({ result: "API is Healthy" + serverStartDate });
});

app.route("/admin/auth", auth);
app.route("/admin/deposit", deposit);
app.route("/admin/image", image);
app.route("/admin/menu", adminMenu);
app.route("/admin/order", adminOrder);
app.route("/admin/role", adminRole);
app.route("/admin/table", adminTable);

app.route("/menu", menu);
app.route("/order", order);
app.route("/table", table);

export default app;
