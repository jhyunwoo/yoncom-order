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
// /admin, /order, /table route 보호
app.use("/admin/*", async (c, next) => protectRoute(c, next, ["admin"]));
app.use("/order/*", async (c, next) => protectRoute(c, next, ["admin"]));
app.use("/table/*", async (c, next) => protectRoute(c, next, ["admin"]));
app.use("/menu/*", async (c, next) => protectRoute(c, next, ["admin"]));

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

export default app;
