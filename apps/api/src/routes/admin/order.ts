import {Hono} from "hono";
import {Bindings, Variables} from "api/lib/bindings";
import {zValidator} from "@hono/zod-validator";
import {deleteValidation} from "shared/api/types/requests/order";
import initializeDb from "api/lib/initialize-db";

const adminOrder = new Hono<{Bindings: Bindings, Variables: Variables}>()

adminOrder.delete('/',zValidator('json',deleteValidation), async(c)=>{
    const {orderId} = c.req.valid('json')
    const db = initializeDb(c.env.DB)



    return c.json({result:"success"}, 200)
})

export default adminOrder