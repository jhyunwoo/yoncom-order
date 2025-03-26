import { Hono } from "hono";
import { Bindings } from "./lib/bindings";
import auth from "./auth";
import order from "./order";
import table from "./table";
import menu from "./menu";
import { authProvider } from "./middlewares/auth-provider";
import admin from "./admin";
import { csrf } from "hono/csrf";

const app = new Hono<{ Bindings: Bindings }>();
app.use("*", csrf());
app.use("*", authProvider);

app.get("/", (c) => {
  return c.json({ result: "API is Healthy" });
});

app.route("/auth", auth);
app.route("/order", order);
app.route("/table", table);
app.route("/menu", menu);
app.route("/admin", admin);

export default app;
