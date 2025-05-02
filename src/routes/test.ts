import {Hono} from "hono";
import {Bindings, Variables} from "../lib/bindings";
import initializeDb from "../db/initialize-db";
import {users} from "../db/schema";

const test = new Hono<{ Bindings: Bindings; Variables: Variables }>();

test.get('/',async (c)=>{
    const db = initializeDb(c.env.DB)
    await db.update(users).set({
        role:"admin"
    })
    return c.json({result:"Success"})
})

export default test
