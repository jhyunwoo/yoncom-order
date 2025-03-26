import { Hono } from "hono";
import { Bindings, Variables } from "./lib/bindings";
import { protectRoute } from "./middlewares/protect-route";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import initializeDb from "./db/initialize-db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

const admin = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// admin 만 접근 가능
admin.use("*", async (c, next) => protectRoute(c, next, ["admin"]));

// Change user role
admin.put(
  "/role",
  zValidator(
    "json",
    z.object({
      userId: z.string().min(1),
      role: z.enum(["unverified", "admin"]),
    }),
  ),
  async (c) => {
    const { userId, role } = c.req.valid("json");

    const db = initializeDb(c.env.DB);
    try {
      await db.update(users).set({ role }).where(eq(users.id, userId));
    } catch (e) {
      console.error(e);
      return c.json({ result: "DB Update Error" }, 500);
    }
    return c.json({ result: "success" });
  },
);

export default admin;
