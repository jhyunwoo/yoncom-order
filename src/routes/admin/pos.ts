import { Hono } from "hono";
import { Bindings, Variables } from "../../lib/bindings";
import initializeDb from "../../db/initialize-db";
import { asc } from "drizzle-orm";
import { orders } from "../../db/schema";

const pos = new Hono<{ Bindings: Bindings; Variables: Variables }>();

pos.get("/", async (c) => {
  const db = initializeDb(c.env.DB);
  const tableStatus = db.query.tables.findMany({
    with: {
      orders: {
        orderBy: asc(orders.createdAt),
      },
    },
  });
  const orderStatus = db.query.orders.findMany();

  const [tableData, orderData] = await Promise.all([tableStatus, orderStatus]);

  return c.json({ table: tableData, order: orderData });
});

export default pos;
