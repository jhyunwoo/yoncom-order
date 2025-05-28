import { initializeLucia } from "./lucia";

export default async function createSession(db: D1Database, userId: string) {
  const lucia = initializeLucia(db);
  const session = await lucia.createSession(userId, {});
  const cookie = lucia.createSessionCookie(session.id);
  cookie.attributes.sameSite = "none";
  cookie.attributes.secure = true;

  return { session, cookie };
}
