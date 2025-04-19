import { Hono } from "hono";
import { Bindings, Variables } from "./lib/bindings";
import auth from "./routes/auth";
import order from "./routes/order";
import table from "./routes/table";
import menu from "./routes/menu";
import { authProvider } from "./middlewares/auth-provider";
import admin from "./routes/admin";
import { protectRoute } from "./middlewares/protect-route";
import customer from "./routes/customer";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import image from "./routes/image";
import deposit from "./routes/deposit";

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
app.use("/admin/*", async (c, next) => protectRoute(c, next, ["admin"]));
app.use("/order/*", async (c, next) => protectRoute(c, next, ["admin"]));
app.use("/table/*", async (c, next) => protectRoute(c, next, ["admin"]));
app.use("/menu/*", async (c, next) => protectRoute(c, next, ["admin"]));
app.use("/image/*", async (c, next) => protectRoute(c, next, ["admin"]));

// 서버 정상 작동 확인용 API
const serverStartDate = new Date();

app.get("/", (c) => {
  return c.json({ result: "API is Healthy" + serverStartDate });
});

app.route("/auth", auth);
app.route("/order", order);
app.route("/table", table);
app.route("/menu", menu);
app.route("/admin", admin);
app.route("/customer", customer);
app.route("/image", image);
app.route("/deposit", deposit);

export default app;
