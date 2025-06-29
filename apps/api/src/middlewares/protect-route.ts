import { Context, Next } from "hono";
import checkUserRole from "api/lib/check-user-role";

export function protectRoute(c: Context, next: Next, role: string[]) {
  if (!checkUserRole(c, role)) {
    console.log("Unauthorized", c.get("user"), c.get("session"));
    return c.json({ error: "Unauthorized" }, 403);
  }

  return next();
}
