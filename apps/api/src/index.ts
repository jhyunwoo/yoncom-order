import { Hono } from "hono";
import { Bindings, Variables } from "./lib/bindings";
import { authProvider } from "./middlewares/auth-provider";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import order from "./routes/order";
import table from "./routes/table";
import menu from "./routes/menu";
import admin from "./routes/admin";
import auth from "./routes/auth";
import initializeDb from "api/lib/initialize-db";
import { users, userRole } from "db/schema";

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

// 서버 정상 작동 확인용 API
const serverStartDate = new Date();

app.get("/", async (c) => {
  const db = initializeDb(c.env.DB);
  await db.update(users).set({
    role: userRole.ADMIN,
  });
  return c.json({ result: "API is Healthy" + serverStartDate });
});

app.route("/admin", admin);
app.route("/auth", auth);
app.route("/menu", menu);
app.route("/order", order);
app.route("/table", table);

export default app;
