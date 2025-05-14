import { eq } from "drizzle-orm";
import * as Schema from "db/schema";
import * as QueryDB from "api/lib/queryDB";
import * as TableRequest from "shared/api/types/requests/table";
import * as TableResponse from "shared/api/types/responses/table";
import ControllerResult from "api/types/controller";

export const create = async (
  db: QueryDB.DB,
  userId: string,
  query: TableRequest.CreateQuery
): Promise<ControllerResult<TableResponse.Create>> => {
  const { tableOptions } = query;

  try {
    const user = (await QueryDB.queryUsers(db, [userId], { tables: true }))[0];

    // 테이블 이름 중복 체크
    if (user.tables
        .filter((table) => table.deletedAt === null)
        .some((table) => table.name === tableOptions.name)
      ) return { error: "Table name already exists", status: 409 };

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
    return { error: "DB Insert Error", status: 500 };
  }
}

export const remove = async (
  db: QueryDB.DB,
  userId: string,
  query: TableRequest.RemoveQuery
): Promise<ControllerResult<TableResponse.Remove>> => {
  const { tableId } = query;

  try {
    const user = (await QueryDB.queryUsers(db, [userId], { tables: true }))[0];
    const table = (await QueryDB.queryTables(db, [tableId], { tableContexts: true }))[0];

    // 유저가 테이블 소유자가 맞는지
    const isTableOwnedByUser = QueryDB.isTablesOwnedByUser(user, [table]);
    if (!isTableOwnedByUser)
      return { error: "Table Not Found", status: 409 };

    // 해당 테이블에 활성화 중인 tableContext가 있는지 확인
    const isTableActive = QueryDB.isTablesOnActivate([table]);
    if (isTableActive)
      return { error: "Table is on use", status: 409 };

    await db
      .update(Schema.tables)
      .set({ deletedAt: Date.now() })
      .where(eq(Schema.tables.id, tableId));

    return { result: "Table removed", status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Delete Error", status: 500 };
  }
}

export const vacate = async (
  db: QueryDB.DB,
  userId: string,
  query: TableRequest.VacateQuery
): Promise<ControllerResult<TableResponse.Vacate>> => {
  const { tableId } = query;

  try {
    const user = (await QueryDB.queryUsers(db, [userId]))[0];
    const table = (await QueryDB.queryTables(db, [tableId], { tableContexts: true }))[0];

    // 유저가 테이블 소유자가 맞는지
    const isTableOwnedByUser = QueryDB.isTablesOwnedByUser(user, [table]);
    if (!isTableOwnedByUser)
      return { error: "Table Not Found", status: 409 };

    // 해당 테이블에 활성화 중인 tableContext가 있는지 확인
    const activeTableContext = QueryDB.chooseActiveTableContext(table.tableContexts);
    if (!activeTableContext)
      return { error: "Table is not occupied yet", status: 409 };

    // 해당 테이블에 끝나지 않은 주문이 있는지
    const tableContextWithOrders = (await QueryDB.queryTableContexts(db, [activeTableContext.id], { orders: true }))[0];
    const orderIds = tableContextWithOrders.orders.map((order) => order.id);
    const activeOrders = await QueryDB.queryOrders(db, orderIds, { onlyActive: true });
    if (activeOrders.length > 0)
      return { error: "There are on active orders in the table", status: 409 };

    await db
      .update(Schema.tableContexts)
      .set({ deletedAt: Date.now() })
      .where(eq(Schema.tableContexts.id, activeTableContext.id));

    return { result: "Table vacated", status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Update Error", status: 500 };
  }
}

export const occupy = async (
  db: QueryDB.DB,
  userId: string,
  query: TableRequest.OccupyQuery
): Promise<ControllerResult<TableResponse.Occupy>> => {
  const { tableId } = query;

  try {
    const user = (await QueryDB.queryUsers(db, [userId]))[0];
    const table = (await QueryDB.queryTables(db, [tableId], { tableContexts: true }))[0];

    // 유저가 테이블 소유자가 맞는지
    const isTableOwnedByUser = QueryDB.isTablesOwnedByUser(user, [table]);
    if (!isTableOwnedByUser)
      return { error: "Table Not Found", status: 409 };

    // 해당 테이블에 비활성화 중인지 확인
    const isTableOnDeactivate = QueryDB.isTablesOnDeactivate([table]);
    console.debug(isTableOnDeactivate);
    if (!isTableOnDeactivate)
      return { error: "Table is already occupied", status: 409 };

    await db
      .insert(Schema.tableContexts)
      .values({ tableId });

    return { result: "Table occupied", status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Insert Error", status: 500 };
  }
}

export const update = async (
  db: QueryDB.DB,
  userId: string,
  query: TableRequest.UpdateQuery
): Promise<ControllerResult<TableResponse.Update>> => {
  const { tableId, tableOptions } = query;

  try {
    const user = (await QueryDB.queryUsers(db, [userId], { tables: true }))[0];
    const table = (await QueryDB.queryTables(db, [tableId]))[0];

    // 유저가 테이블 소유자가 맞는지
    const isTableOwnedByUser = QueryDB.isTablesOwnedByUser(user, [table]);
    if (!isTableOwnedByUser)
      return { error: "Table Not Found", status: 409 };  

    // 테이블 이름 중복 체크
    if (user.tables
      .filter((table) => table.deletedAt === null)
      .some((table) => table.name === tableOptions.name)
    ) return { error: "Table name already exists", status: 409 };
    
    await db
      .update(Schema.tables)
      .set(tableOptions)
      .where(eq(Schema.tables.id, tableId));

    return { result: "Table updated", status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Update Error", status: 500 };
  }
}

export const clientGet = async (
  db: QueryDB.DB,
  query: TableRequest.ClientGetQuery
): Promise<ControllerResult<TableResponse.ClientGet>> => {
  const { tableId } = query;

  try {
    const table = (await QueryDB.queryTables(db, [tableId], { tableContexts: true }))[0];
    if (!table)
      return { error: "Table Not Found", status: 409 };

    // 활성화 table context가 있다면 해당 내역을 같이 첨부.
    // 없다면 비활성화된 table context는 보여주면 안되므로 빈 배열 첨부

    const activeTableContext = QueryDB.chooseActiveTableContext(table.tableContexts);
    if (!activeTableContext) 
      return { result: { ...table, tableContexts: [] }, status: 200 };

    const tableContextWithOrders = (await QueryDB.queryTableContexts(db, [activeTableContext.id], { orders: true }))[0];
    const orders = await QueryDB.queryOrders(db, tableContextWithOrders.orders, { menuOrders: true, payment: true });
    return { 
      result: { ...table, tableContexts: [{ ...activeTableContext, orders }] },
      status: 200 
    };

  } catch (e) {
    console.error(e);
    return { error: "DB Select Error", status: 500 };
  }
}

export const adminGet = async (
  db: QueryDB.DB,
  userId: string,
  query: TableRequest.AdminGetQuery
): Promise<ControllerResult<TableResponse.AdminGet>> => {
  const { tableIds } = query;

  try {
    const user = (await QueryDB.queryUsers(db, [userId], { tables: true }))[0];
    if (tableIds?.some((tableId) => !user.tables.map((table) => table.id).includes(tableId)))
      return { error: "Table Not Found", status: 409 };

    const tables = tableIds === undefined
      ? user.tables
      : user.tables.filter((table) => tableIds.includes(table.id));

    const result = await QueryDB.queryTables(db, tables, { tableContexts: true })
      .then((tables) => Promise.all(
        tables.splice(0, 10).map(async (table) => {
          const tableContexts = await QueryDB.queryTableContexts(db, table.tableContexts, { orders: true });
          const resolvedTableContexts = await Promise.all(tableContexts.map(async (tableContext) => {
            const orders = await QueryDB.queryOrders(db, tableContext.orders, { menuOrders: true, payment: true });
            return { ...tableContext, orders };
          }));
          return { ...table, tableContexts: resolvedTableContexts };
        })
      ));

    return { result, status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Select Error", status: 500 };
  }
}