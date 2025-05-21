import {Hono} from "hono";
import {Bindings, Variables} from "api/lib/bindings";
import {zValidator} from "@hono/zod-validator";
import initializeDb from "api/lib/initialize-db";
import { payments} from "db/schema";
import {createValidation} from "shared/api/types/requests/deposit";
import {eq} from "drizzle-orm";

const deposit = new Hono<{ Bindings: Bindings; Variables: Variables }>()

deposit.post('/', zValidator('json',createValidation), async (c)=>{
    const {amount, bank, timestamp, name} = c.req.valid('json')

    const db = initializeDb(c.env.DB)

    const remainingPayments = await db.query.payments.findMany(
        {
            where: eq(payments.amount, amount)
        }
    )

    if(remainingPayments.length === 0){
        return c.json({result:'fail'}, 400)
    }

    const updatePaidStatus = await db.update(payments).set({
        paid:true,
        bank: bank,
        createdAt: timestamp,
        depositor: name
    }).where(eq(payments.id, remainingPayments[0].id)).returning()

    if(updatePaidStatus.length === 0){
        return c.json({result:'fail'}, 400)
    }

    return c.json({result: 'ok'}, 200)
})