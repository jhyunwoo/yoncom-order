import { DrizzleD1Database } from "drizzle-orm/d1";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { createOrderValidation, getOrderValidation } from "api/lib/validations";
import { z } from "zod";
import * as QueryDB from "api/lib/queryDB";
import * as TableController from "api/controller/table.controller";
import * as Schema from "db/schema";

type DB = DrizzleD1Database<typeof import("db/schema")> & { $client: D1Database; };

export const create = async (
  db: DB,
  query: z.infer<typeof createOrderValidation>
): Promise<{ result: string; status: ContentfulStatusCode }> => {
  const { tableId, menuOrders } = query;

  try {
    // 해당 테이블 존재 여부 확인
    const table = (await QueryDB.queryTables(db, [tableId]))[0];
    if (!table) 
      return { result: "Table Not Found", status: 403 };

    // 해당 테이블에 활성 context가 없다면 occupy
    let activeTableContext = (await QueryDB.queryTableContexts(db, table.tableContexts as string[], {
      onlyActive: true,
    }))[0];
    if (!activeTableContext)
      await TableController.occupy(db, table.userId, { tableId });
    activeTableContext = (await QueryDB.queryTableContexts(db, table.tableContexts as string[], {
      onlyActive: true,
    }))[0];

    // 주문에 들어온 메뉴가 모두 존재하는지 확인
    const menuIds = menuOrders.map((menuOrder) => menuOrder.menuId);
    const menus = await QueryDB.queryMenus(db, menuIds, { withMenuCategory: true });
    if (menus.length !== menuIds.length)
      return { result: "Menu Not Found", status: 403 };
    if (menus.some((menu) => menu.menuCategory.userId !== table.userId))
      return { result: "Menu Not Found", status: 403 };

    // order 생성
    const order = (await db
      .insert(Schema.orders)
      .values({
        tableContextId: activeTableContext.id,
      }).returning())[0];

    // menuOrders 생성
    await db
      .insert(Schema.menuOrders)
      .values(menuOrders.map((menuOrder) => ({
        ...menuOrder,
        orderId: order.id,
      })));

    return { result: "Order Created", status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Insert Error", status: 500 };
  }
}

export const get = async (
  db: DB,
  query: z.infer<typeof getOrderValidation>
): Promise<{ result: typeof Schema.orders.$inferSelect | string; status: ContentfulStatusCode }> => {
  const { orderId } = query;  

  try {
    const order = (await QueryDB.queryOrders(db, [orderId], {
      withTableContext: true,
      withMenuOrders: true,
    }))[0];
    if (!order)
      return { result: "Order Not Found", status: 403 };

    return { result: order, status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Query Error", status: 500 };
  }
}
