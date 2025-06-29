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
    origin: ["http://localhost:5173", "https://yoncomorder.moveto.kr"],
    credentials: true, // <-- 이게 핵심
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], // preflight 대응
  }),
);

// 서버 정상 작동 확인용 API
const serverStartDate = new Date();

app.get("/api", async (c) => {
  const db = initializeDb(c.env.DB);
  // TODO: Remove this line in production
  await db.update(users).set({
    role: userRole.ADMIN,
  });
  return c.json({ result: "API is Healthy" + serverStartDate });
});

app.get("/image/:filename", async (c) => {
  const filename = c.req.param("filename");

  const object = await c.env.R2_BUCKET.get(filename);

  if (!object || !object.body) {
    return c.text("Image not found", 404);
  }

  return new Response(object.body, {
    headers: {
      "Content-Type":
        object.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=86400",
    },
  });
});

app.route("/api/admin", admin);
app.route("/api/auth", auth);
app.route("/api/menu", menu);
app.route("/api/order", order);
app.route("/api/table", table);

export default app;
