import { Context, Next } from "hono";
import { initializeLucia } from "api/lib/lucia";
import { getCookie } from "hono/cookie";

export async function authProvider(c: Context, next: Next) {
  const lucia = initializeLucia(c.env.DB);

  // 쿠키에서 sessionId 가져오기
  const sessionId = getCookie(c, lucia.sessionCookieName);

  // 세션 아이디가 없으면 사용자와 세션을 null로 설정하고 다음 미들웨어로 이동
  if (!sessionId) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  // 세션을 유효성 검사하고 사용자와 세션을 설정
  const { session, user } = await lucia.validateSession(sessionId);

  // 세션을 재발행 해야한다면 새로 생성 후 쿠키로 설정
  if (session && session.fresh) {
    c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
      append: true,
    });
  }

  // 세션이 없으면 빈 세션을 생성하고 쿠키로 설정
  if (!session) {
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
      append: true,
    });
  }

  // Hono Context에 사용자와 세션을 설정하고 다음 미들웨어로 이동
  c.set("user", user);
  c.set("session", session);
  return next();
}
