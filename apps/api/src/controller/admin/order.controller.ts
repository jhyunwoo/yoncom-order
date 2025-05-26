import * as QueryDB from "api/lib/queryDB";
import { orders } from "db/schema";
import { eq } from "drizzle-orm";

export const createOrder = async (
  db: QueryDB.DB,
  data: orders.$inferInsert,
) => {
  try {
    const newOrder = await db.insert(orders).values(data).returning();
    return { result: newOrder, status: 201 };
  } catch (e) {
    console.error(e);
    return { error: "DB Insert Error", status: 500 };
  }
};

export const deleteOrder = async (db: QueryDB.DB, orderId: string) => {
  try {
    await db
      .update(orders)
      .set({ deletedAt: new Date().getTime() })
      .where(eq(orders.id, orderId));
  } catch (e) {
    return { error: "DB Insert Error", status: 500 };
  }
};
