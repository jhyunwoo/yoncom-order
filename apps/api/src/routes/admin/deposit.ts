import { Hono } from "hono";
import { Bindings, Variables } from "api/lib/bindings";
import { zValidator } from "@hono/zod-validator";
import initializeDb from "api/lib/initialize-db";
import { payments } from "db/schema";
import { createValidation } from "shared/api/types/requests/admin/deposit";
import { desc, eq } from "drizzle-orm";

const deposit = new Hono<{ Bindings: Bindings; Variables: Variables }>();

deposit.post("/", zValidator("json", createValidation), async (c) => {
  // body에서 데이터를 가져옴
  const { amount, bank, timestamp, name } = c.req.valid("json");

  const db = initializeDb(c.env.DB);

  // 사용자가 입금한 금액과 동일한 금액을 입금 받아야하는 payments를 모두 조회
  const remainingPayments = await db.query.payments.findMany({
    where: eq(payments.amount, amount),
    orderBy: desc(payments.createdAt),
  });

  // 만약 payment가 없으면 오류 후 종료
  if (remainingPayments.length === 0) {
    return c.json({ result: "fail" }, 400);
  }

  // 입금 받은 payment의 상태를 paid로 변경
  const updatePaidStatus = await db
    .update(payments)
    .set({
      paid: true,
      bank: bank,
      createdAt: timestamp,
      depositor: name,
    })
    .where(eq(payments.id, remainingPayments[0].id))
    .returning();

  // 만약 업데이트된 payment가 없다면 오류 후 종료
  if (updatePaidStatus.length === 0) {
    return c.json({ result: "fail" }, 400);
  }

  return c.json({ result: "ok" }, 200);
});

export default deposit;
