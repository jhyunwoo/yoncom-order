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

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();
app.use(logger());
app.use(authProvider);

// /admin, /order, /table route 보호
app.use("/admin/*", async (c, next) => protectRoute(c, next, ["admin"]));
app.use("/order/*", async (c, next) => protectRoute(c, next, ["admin"]));
app.use("/table/*", async (c, next) => protectRoute(c, next, ["admin"]));

app.get("/", (c) => {
  return c.json({ result: "API is Healthy" });
});

app.route("/auth", auth);
app.route("/order", order);
app.route("/table", table);
app.route("/menu", menu);
app.route("/admin", admin);
app.route("/customer", customer);

export default app;
