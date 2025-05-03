import { Hono } from "hono";
import {Bindings, Variables} from "../../lib/bindings";
import initializeDb from "../../db/initialize-db";

const pos = new Hono<{Bindings: Bindings, Variables: Variables}>()

pos.get('/', async (c)=>{
    const db = initializeDb(c.env.DB)

})

export default pos;