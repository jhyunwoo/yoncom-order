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
import order from "./routes/order";
import table from "./routes/table";
import test from "./routes/test";
import menu from "./routes/menu";
import admin from "./routes/admin";

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

app.route("/admin", admin);

app.route("/menu", menu);
app.route("/order", order);
app.route("/table", table);

app.route('/test', test)

export default app;
