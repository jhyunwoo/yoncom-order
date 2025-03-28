import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";

export async function customerToken(c: Context, next: Next) {
  // 쿠키에서 token 가져오기
  const token = getCookie(c, "customer_token");

  c.set("customerToken", token);
  return next();
}
