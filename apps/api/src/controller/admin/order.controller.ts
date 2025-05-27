import * as QueryDB from "api/lib/queryDB";
import { menuOrders, menus, orders } from "db/schema";
import { eq, sql } from "drizzle-orm";

export const deleteOrder = async (db: QueryDB.DB, orderId: string) => {
  try {
    const orderData = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        menuOrders: true,
      },
    });

    for (const menuOrder of orderData?.menuOrders || []) {
      await db.update(menus).set({
        quantity: sql`${menus.quantity} + ${menuOrder.quantity}`,
      });
    }

    await Promise.all([
      db
        .update(menuOrders)
        .set({ deletedAt: new Date().getTime() })
        .where(eq(menuOrders.orderId, orderId)),

      db
        .update(orders)
        .set({ deletedAt: new Date().getTime() })
        .where(eq(orders.id, orderId)),
    ]);
    return { result: "Order deleted successfully", status: 200 };
  } catch (e) {
    return { error: "DB Insert Error", status: 500 };
  }
};
