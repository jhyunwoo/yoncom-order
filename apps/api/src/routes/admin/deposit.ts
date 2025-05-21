import {Hono} from "hono";
import {Bindings, Variables} from "api/lib/bindings";
import {zValidator} from "@hono/zod-validator";
import {z} from "zod";
import initializeDb from "api/lib/initialize-db";
import {eq} from "drizzle-orm";
import {tables} from "db/schema";

const deposit = new Hono<{ Bindings: Bindings; Variables: Variables }>()

deposit.post('/', zValidator('json',), async (c)=>{
    const {amount, bank, timestamp, name} = c.req.valid('json')
    console.log(amount, bank, timestamp, name)

    const db = initializeDb(c.env.DB)

    const tableId = 100 - amount % 100

    const table  = await db.query.tables.findFirst({
        where: eq(tables.key, tableId),
        with:{
            tableContexts:{
                with:{
                    orders:true
                }
            }
        }
    })





    return c.json({result: 'ok'}, 200)
})