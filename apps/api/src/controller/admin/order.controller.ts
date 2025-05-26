import * as QueryDB from "api/lib/queryDB";
import { orders } from "db/schema";
import { eq } from "drizzle-orm";

export const deleteOrder = async (db: QueryDB.DB, orderId: string) => {
  try {
    await db
      .update(orders)
      .set({ deletedAt: new Date().getTime() })
      .where(eq(orders.id, orderId));
    return { result: "Order deleted successfully", status: 200 };
  } catch (e) {
    return { error: "DB Insert Error", status: 500 };
  }
};
