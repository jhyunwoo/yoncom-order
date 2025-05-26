import { Hono } from "hono";
import { Bindings, Variables } from "api/lib/bindings";
import { zValidator } from "@hono/zod-validator";
import initializeDb from "api/lib/initialize-db";
import { payments } from "db/schema";
import { createValidation } from "shared/types/requests/admin/deposit";
import { and, desc, eq } from "drizzle-orm";

const adminDeposit = new Hono<{ Bindings: Bindings; Variables: Variables }>()

adminDeposit.post('/', zValidator('json', createValidation), async (c)=>{
    const {amount, bank, timestamp, name} = c.req.valid('json')

    const db = initializeDb(c.env.DB)

    const realAmount = Math.ceil(amount / 100) * 100;
    const tableKey = realAmount - amount;

    console.debug(realAmount, tableKey)

    // 사용자가 입금한 금액과 동일한 금액을 입금 받아야하는 payments를 모두 조회
    const remainingPayments = (await db.query.payments.findMany({
        where: and(
            eq(payments.amount, realAmount),
            eq(payments.paid, false)
        ),
        orderBy: desc(payments.createdAt),
        with: {
            order: {
                with: {
                    tableContext: {
                        with: {
                            table: true
                        }
                    }
                }
            }
        }
    })).filter((payment) => payment.order.tableContext.table.key === tableKey);

    // 만약 payment가 없으면 오류 후 종료
    if(remainingPayments.length === 0){
        return c.json({result:'there are no payments require requested deposit'}, 400)
    }

    // 입금 받은 payment의 상태를 paid로 변경
    const updatePaidStatus = await db.update(payments).set({
        paid:true,
        bank: bank,
        updatedAt: timestamp,
        depositor: name
    }).where(eq(payments.id, remainingPayments[0].id)).returning()

    // 만약 업데이트된 payment가 없다면 오류 후 종료
    if(updatePaidStatus.length === 0){
        return c.json({result:'fail'}, 400)
    }

    return c.json({result: 'ok'}, 200)
})

export default adminDeposit;