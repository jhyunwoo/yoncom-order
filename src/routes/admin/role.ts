import { Hono } from "hono";
import { Bindings, Variables } from "../../lib/bindings";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import initializeDb from "../../db/initialize-db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

const adminRole = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Change user role
adminRole.put(
  "/role",
  zValidator(
    "json",
    z.object({
      userId: z.string().min(1),
      role: z.enum(["unverified", "role"]),
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

export default adminRole;
