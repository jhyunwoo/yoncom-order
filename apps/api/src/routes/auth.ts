import { Hono } from "hono";
import { Bindings, Variables } from "api/lib/bindings";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { users } from "db/schema";
import { Scrypt } from "lucia";
import initializeDb from "api/lib/initialize-db";
import { initializeLucia } from "api/lib/lucia";
import * as AuthRequest from "shared/types/requests/client/auth";
import createSession from "api/lib/create-session";

const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Sign Up Route
auth.post(
  "/sign-up",
  zValidator("json", AuthRequest.signUpValidation),
  async (c) => {
    const { email, password, name } = c.req.valid("json");

    const db = initializeDb(c.env.DB);

    // 기존 사용자인지 확인
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return c.json({ error: "User with that email already exists." }, 400);
    }

    // 비밀번호 해싱
    const passwordHash = await new Scrypt().hash(password);

    // 사용자 정보 추가
    const user = await db
      .insert(users)
      .values({ email, password: passwordHash, name })
      .returning({ id: users.id, email: users.email });

    if (!user || user.length === 0) {
      return c.json({ error: "An error occured during sign up." }, 500);
    }

    // 세션 생성
    const { cookie } = await createSession(c.env.DB, user[0].id);

    c.header("Set-Cookie", cookie.serialize(), { append: true });

    return c.json({ result: "Success" }, 200);
  },
);

// Sign In Route
auth.post(
  "/sign-in",
  zValidator("json", AuthRequest.signInValidation),
  async (c) => {
    c.header("Set-Cookie", "user=dddd, session=dddd", {
      append: true,
    });

    return c.json({ result: "Success" }, 200);
  },
);

// Sign Out Route
auth.post("/sign-out", async (c) => {
  const lucia = initializeLucia(c.env.DB);

  // 세션 정보 확인
  const session = c.get("session");
  // 세션이 존재하면 무효화
  if (session) {
    await lucia.invalidateSession(session.id);
  }

  // 빈 세션 쿠키 생성
  const cookie = lucia.createBlankSessionCookie();
  cookie.attributes.sameSite = "none";
  cookie.attributes.secure = true;
  c.header("Set-Cookie", cookie.serialize(), { append: true });

  return c.json({ result: "Success" }, 200);
});

export default auth;
