import { Hono } from "hono";
import { Bindings, Variables } from "./lib/bindings";
import { authProvider } from "./middlewares/auth-provider";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import order from "./routes/client/order";
import table from "./routes/client/table";
import menu from "./routes/client/menu";
import auth from "./routes/client/auth";
import admin from "./routes/admin";
import initializeDb from "api/lib/initialize-db";
import { users, userRole } from "db/schema";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middlewares
app.use(logger());
app.use(authProvider);
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "https://example.org"],
    credentials: true, // <-- 이게 핵심
    allowHeaders: ["Content-Type"], // 필요한 헤더 추가
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], // preflight 대응
  })
);

// 서버 정상 작동 확인용 API
const serverStartDate = new Date();

app.get("/api", async (c) => {
  const db = initializeDb(c.env.DB);
  await db.update(users).set({
    role: userRole.ADMIN,
  });
  return c.json({ result: "API is Healthy" + serverStartDate });
});

app.route("/api/admin", admin);
app.route("/api/auth", auth);
app.route("/api/menu", menu);
app.route("/api/order", order);
app.route("/api/table", table);
app.route("/order", order);

export default app;
