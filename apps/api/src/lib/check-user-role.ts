import { Context } from "hono";

export default function checkUserRole(c: Context, role: string[]) {
  const user = c.get("user");

  return !!(user && role.includes(user.role));
}
