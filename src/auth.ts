import { Hono } from "hono";
import { Bindings, Variables } from "./lib/bindings";
import { authMiddleware } from "./middlewares/auth-middleware";
import { csrf } from "hono/csrf";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { users } from "./db/schema";
import { Scrypt } from "lucia";
import initializeDb from "./db/initialize-db";
import { initializeLucia } from "./lib/lucia";
import { signInValidation, signUpValidation } from "./lib/validations";
import createSession from "./lib/create-session";

const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>();

auth.use(csrf());

auth.use("*", authMiddleware);

// Sign Up Route
auth.post("/sign-up", zValidator("json", signUpValidation), async (c) => {
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

  return c.json({ result: "Success" });
});

// Sign In Route
auth.post("/sign-in", zValidator("json", signInValidation), async (c) => {
  const { email, password } = c.req.valid("json");
  const db = initializeDb(c.env.DB);

  // 사용자 정보 확인
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return c.json({ error: "Email or password is incorrect." }, 400);
  }

  // 비밀번호 확인
  const isValidPassword = await new Scrypt().verify(user.password, password);

  if (!isValidPassword) {
    return c.json({ error: "Email or password is incorrect." }, 400);
  }

  const { cookie } = await createSession(c.env.DB, user.id);

  c.header("Set-Cookie", cookie.serialize(), { append: true });

  return c.json({ result: "Success" });
});

// Sign Out Route
auth.post("/sign-out", async (c) => {
  const lucia = initializeLucia(c.env.DB);

  // 세션 정보 확인
  const session = c.get("session");
  console.log(session);
  // 세션이 존재하면 무효화
  if (session) {
    await lucia.invalidateSession(session.id);
  }

  // 빈 세션 쿠키 생성
  const cookie = lucia.createBlankSessionCookie();
  c.header("Set-Cookie", cookie.serialize(), { append: true });

  return c.json({ result: "Success" });
});

export default auth;
