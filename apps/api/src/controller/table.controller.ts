import { DrizzleD1Database } from "drizzle-orm/d1";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { createTableValidation, deleteTableValidation, clientGetTableValidation, occupyTableValidation, updateTableValidation, vacateTableValidation, adminGetTableValidation } from "api/lib/validations";
import { z } from "zod";
import * as QueryDB from "api/lib/queryDB";
import * as Schema from "db/schema";
import { eq } from "drizzle-orm";

type DB = DrizzleD1Database<typeof import("db/schema")> & { $client: D1Database; };

export const create = async (
  db: DB,
  userId: string,
  query: z.infer<typeof createTableValidation>
): Promise<{ result: string; status: ContentfulStatusCode }> => {
  const { tableOptions } = query;

  try {
    const user = (await QueryDB.queryUsers(db, [userId], { tables: true }))[0];

    // 테이블 이름 중복 체크
    if (user.tables
        .filter((table) => table.deletedAt === null)
        .some((table) => table.name === tableOptions.name)
      ) return { result: "Table name already exists", status: 409 };

    const key = user.tables
      .filter((table) => table.deletedAt === null)
      .sort((a, b) => a.key - b.key)
      .reduce((acc, table) => (acc === table.key ? acc + 1 : acc), 1);

    await db
      .insert(Schema.tables)
      .values({ ...tableOptions, key, userId });

    return { result: "Table created", status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Insert Error", status: 500 };
  }
}

export const remove = async (
  db: DB,
  userId: string,
  query: z.infer<typeof deleteTableValidation>
): Promise<{ result: string; status: ContentfulStatusCode }> => {
  const { tableId } = query;

  try {
    const user = (await QueryDB.queryUsers(db, [userId], { tables: true }))[0];
    const table = (await QueryDB.queryTables(db, [tableId], { tableContexts: true }))[0];

    // 유저가 테이블 소유자가 맞는지
    const isTableOwnedByUser = QueryDB.isTablesOwnedByUser(user, [table]);
    if (!isTableOwnedByUser)
      return { result: "Table Not Found", status: 403 };

    // 해당 테이블에 활성화 중인 tableContext가 있는지 확인
    const isTableActive = QueryDB.isTablesOnActivate([table]);
    if (isTableActive)
      return { result: "Table is on use", status: 403 };

    await db
      .update(Schema.tables)
      .set({ deletedAt: Date.now() })
      .where(eq(Schema.tables.id, tableId));

    return { result: "Table removed", status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Delete Error", status: 500 };
  }
}

export const vacate = async (
  db: DB,
  userId: string,
  query: z.infer<typeof vacateTableValidation>
): Promise<{ result: string; status: ContentfulStatusCode }> => {
  const { tableId } = query;

  try {
    const user = (await QueryDB.queryUsers(db, [userId]))[0];
    const table = (await QueryDB.queryTables(db, [tableId], { tableContexts: true }))[0];

    // 유저가 테이블 소유자가 맞는지
    const isTableOwnedByUser = QueryDB.isTablesOwnedByUser(user, [table]);
    if (!isTableOwnedByUser)
      return { result: "Table Not Found", status: 403 };

    // 해당 테이블에 활성화 중인 tableContext가 있는지 확인
    const activeTableContext = QueryDB.chooseActiveTableContext(table.tableContexts);
    if (!activeTableContext)
      return { result: "Table is not occupied yet", status: 403 };

    // 해당 테이블에 끝나지 않은 주문이 있는지
    const tableContextWithOrders = (await QueryDB.queryTableContexts(db, [activeTableContext.id], { orders: true }))[0];
    const orderIds = tableContextWithOrders.orders.map((order) => order.id);
    const activeOrders = await QueryDB.queryOrders(db, orderIds, { onlyActive: true });
    if (activeOrders.length > 0)
      return { result: "There are on active orders in the table", status: 403 };

    await db
      .update(Schema.tableContexts)
      .set({ deletedAt: Date.now() })
      .where(eq(Schema.tableContexts.id, activeTableContext.id));

    return { result: "Table vacated", status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Update Error", status: 500 };
  }
}

export const occupy = async (
  db: DB,
  userId: string,
  query: z.infer<typeof occupyTableValidation>
): Promise<{ result: string; status: ContentfulStatusCode }> => {
  const { tableId } = query;

  try {
    const user = (await QueryDB.queryUsers(db, [userId]))[0];
    const table = (await QueryDB.queryTables(db, [tableId], { tableContexts: true }))[0];

    // 유저가 테이블 소유자가 맞는지
    const isTableOwnedByUser = QueryDB.isTablesOwnedByUser(user, [table]);
    if (!isTableOwnedByUser)
      return { result: "Table Not Found", status: 403 };

    // 해당 테이블에 비활성화 중인지 확인
    const isTableOnDeactivate = QueryDB.isTablesOnDeactivate([table]);
    console.debug(isTableOnDeactivate);
    if (!isTableOnDeactivate)
      return { result: "Table is already occupied", status: 403 };

    await db
      .insert(Schema.tableContexts)
      .values({ tableId });

    return { result: "Table occupied", status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Insert Error", status: 500 };
  }
}

export const update = async (
  db: DB,
  userId: string,
  query: z.infer<typeof updateTableValidation>
): Promise<{ result: string; status: ContentfulStatusCode }> => {
  const { tableId, tableOptions } = query;

  try {
    const user = (await QueryDB.queryUsers(db, [userId], { tables: true }))[0];
    const table = (await QueryDB.queryTables(db, [tableId]))[0];

    // 유저가 테이블 소유자가 맞는지
    const isTableOwnedByUser = QueryDB.isTablesOwnedByUser(user, [table]);
    if (!isTableOwnedByUser)
      return { result: "Table Not Found", status: 403 };  

    // 테이블 이름 중복 체크
    if (user.tables
      .filter((table) => table.deletedAt === null)
      .some((table) => table.name === tableOptions.name)
    ) return { result: "Table name already exists", status: 409 };
    
    await db
      .update(Schema.tables)
      .set(tableOptions)
      .where(eq(Schema.tables.id, tableId));

    return { result: "Table updated", status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Update Error", status: 500 };
  }
}

export const clientGet = async (
  db: DB,
  query: z.infer<typeof clientGetTableValidation>
): Promise<{ result: Schema.Table & {
  tableContexts: (Schema.TableContext & {
    orders: (Schema.Order & {
      menuOrders: Schema.MenuOrder[],
    })[],
  })[],
} | string; status: ContentfulStatusCode }> => {
  const { tableId } = query;

  try {
    const table = (await QueryDB.queryTables(db, [tableId], { tableContexts: true }))[0];
    if (!table)
      return { result: "Table Not Found", status: 403 };

    // 활성화 table context가 있다면 해당 내역을 같이 첨부.
    // 없다면 비활성화된 table context는 보여주면 안되므로 빈 배열 첨부

    const activeTableContext = QueryDB.chooseActiveTableContext(table.tableContexts);
    if (!activeTableContext) 
      return { result: { ...table, tableContexts: [] }, status: 200 };

    const tableContextWithOrders = (await QueryDB.queryTableContexts(db, [activeTableContext.id], { orders: true }))[0];
    const orders = await QueryDB.queryOrders(db, tableContextWithOrders.orders, { menuOrders: true });
    return { 
      result: { ...table, tableContexts: [{ ...activeTableContext, orders }] },
      status: 200 
    };

  } catch (e) {
    console.error(e);
    return { result: "DB Select Error", status: 500 };
  }
}

export const adminGet = async (
  db: DB,
  userId: string,
  query: z.infer<typeof adminGetTableValidation>
): Promise<{ result: (Schema.Table & {
  tableContexts: (Schema.TableContext & {
    orders: (Schema.Order & {
      menuOrders: Schema.MenuOrder[],
    })[],
  })[],
})[] | string; status: ContentfulStatusCode }> => {
  const { tableIds } = query;

  try {
    const user = (await QueryDB.queryUsers(db, [userId], { tables: true }))[0];
    if (tableIds?.some((tableId) => !user.tables.map((table) => table.id).includes(tableId)))
      return { result: "Table Not Found", status: 403 };

    const tables = tableIds === undefined
      ? user.tables
      : user.tables.filter((table) => tableIds.includes(table.id));

    const result = await QueryDB.queryTables(db, tables, { tableContexts: true })
      .then((tables) => Promise.all(
        tables.splice(0, 10).map(async (table) => {
          const tableContexts = await QueryDB.queryTableContexts(db, table.tableContexts, { orders: true });
          const resolvedTableContexts = await Promise.all(tableContexts.map(async (tableContext) => {
            const orders = await QueryDB.queryOrders(db, tableContext.orders, { menuOrders: true });
            return { ...tableContext, orders };
          }));
          return { ...table, tableContexts: resolvedTableContexts };
        })
      ));

    return { result, status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Select Error", status: 500 };
  }
}