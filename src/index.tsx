import { Hono } from "hono";
import { Bindings } from "./lib/bindings";
import auth from "./auth";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.json({ result: "Auth API is Healthy" });
});

app.route("/auth", auth);

export default app;
