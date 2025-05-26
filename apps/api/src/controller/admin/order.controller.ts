import * as QueryDB from "api/lib/queryDB";
import { orders, tableContexts } from "db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { CreateOrder } from "shared/api/types/requests/admin/order";

export const createOrder = async (db: QueryDB.DB, data: CreateOrder) => {
  try {
    let findTableContext = await db.query.tableContexts.findFirst({
      where: and(
        eq(tableContexts.tableId, data.tableId),
        isNull(tableContexts.deletedAt),
      ),
    });
    if (!findTableContext) {
      findTableContext = (
        await db
          .insert(tableContexts)
          .values({
            tableId: data.tableId,
          })
          .returning()
      )[0];
    }

    const newOrder = await db
      .insert(orders)
      .values({
        tableContextId: findTableContext.id,
      })
      .returning();
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
    return { result: "Order deleted successfully", status: 200 };
  } catch (e) {
    return { error: "DB Insert Error", status: 500 };
  }
};
