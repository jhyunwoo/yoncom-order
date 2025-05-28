import { Hono } from "hono";
import { Bindings, Variables } from "api/lib/bindings";
import initializeDb from "api/lib/initialize-db";
import { isNull } from "drizzle-orm";
import { orders } from "db/schema";

const payout = new Hono<{ Bindings: Bindings; Variables: Variables }>();

payout.get("/", async (c) => {
  const db = initializeDb(c.env.DB);

  try {
    const paidOrders = await db.query.orders.findMany({
      where: isNull(orders.deletedAt),
      with: {
        payment: true,
      },
    });
    let totalPayout = 0;
    for (const order of paidOrders) {
      totalPayout += order.payment?.amount || 0;
    }
    return c.json(
      {
        result: {
          totalPayout,
        },
      },
      200,
    );
  } catch (error) {
    return c.json({ error: "Failed to retrieve payouts" }, 500);
  }
});

export default payout;
