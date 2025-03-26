import { Context, Next } from "hono";
import checkUserRole from "../lib/check-user-role";

export function protectRoute(c: Context, next: Next, role: string[]) {
  if (!checkUserRole(c, role)) {
    return c.json({ result: "Unauthorized" }, 403);
  }

  return next();
}
