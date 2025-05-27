import { and, eq, isNull } from "drizzle-orm";
import * as Schema from "db/schema";
import * as QueryDB from "api/lib/queryDB";
import * as TableResponse from "shared/types/responses/admin/table";
import ControllerResult from "api/types/controller";
import * as AdminTable from "shared/types/requests/admin/table";
import { orders, tableContexts, tables } from "db/schema";

/**
 * Admin에서 테이블을 생성하는 함수
 * @param db
 * @param query
 */
export const createTable = async (
  db: QueryDB.DB,
  query: AdminTable.Create,
): Promise<ControllerResult<TableResponse.Create>> => {
  try {
    // 테이블 이름 중복 체크
    if (
      (
        await db.query.tables.findFirst({
          where: eq(tables.name, query.tableOptions.name),
        })
      )?.id
    )
      return { error: "Table name already exists", status: 409 };

    const tableData = await db.query.tables.findMany({
      where: isNull(tables.deletedAt),
    });

    // create 1 to 100 array
    const keyList = Array.from({ length: 100 }, (_, i) => i + 1);

    let lowestKey;
    // 테이블 키 중복 체크
    for (const table of tableData) {
      if (keyList.includes(table.key)) {
        keyList.splice(keyList.indexOf(table.key), 1);
      }
    }

    lowestKey = keyList[0];

    await db.insert(Schema.tables).values({
      name: query.tableOptions.name,
      seats: query.tableOptions.seats,
      key: lowestKey,
    });

    return { result: "Table created", status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Insert Error", status: 500 };
  }
};

/**
 * Admin에서 테이블을 삭제하는 함수
 * deleteAt 컬럼에 현재 시간을 넣어 soft delete를 수행
 * @param db
 * @param query
 */
export const removeTable = async (
  db: QueryDB.DB,
  query: AdminTable.Remove,
): Promise<ControllerResult<TableResponse.Remove>> => {
  try {
    const { tableId } = query;

    // 활성화된 tableContext가 있는지 확인
    const activeTableContexts = await db.query.tableContexts.findFirst({
      where: and(
        eq(tableContexts.tableId, tableId),
        isNull(tableContexts.deletedAt),
      ),
    });

    if (activeTableContexts) {
      return { error: "Table is occupied", status: 409 };
    }

    await db
      .update(tables)
      .set({ deletedAt: Date.now() })
      .where(eq(tables.id, tableId));

    return { result: "Table removed", status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Delete Error", status: 500 };
  }
};

/**
 * Admin에서 테이블 점유를 푸는 함수
 * @param db
 * @param query
 */
export const vacateTable = async (
  db: QueryDB.DB,
  query: AdminTable.Vacate,
): Promise<ControllerResult<TableResponse.Vacate>> => {
  const { tableId } = query;

  try {
    // 해당 테이블에 활성화 중인 tableContext가 있는지 확인
    const activeTableContext = await db.query.tableContexts.findFirst({
      where: and(
        eq(tableContexts.tableId, tableId),
        isNull(tableContexts.deletedAt),
      ),
      columns: {
        id: true,
      },
    });
    if (!activeTableContext)
      return { error: "Table is not occupied yet", status: 409 };

    // 해당 테이블에 끝나지 않은 주문이 있는지
    const unfinishedOrders = await db.query.orders.findFirst({
      where: and(
        isNull(orders.deletedAt),
        eq(orders.tableContextId, activeTableContext.id),
      ),
      with: {
        payment: true,
        menuOrders: true,
      },
    });

    if (
      !unfinishedOrders?.payment?.paid ||
      unfinishedOrders?.menuOrders.some((order) => order.status === "PENDING")
    ) {
      return { error: "There are on active orders in the table", status: 409 };
    }

    await db
      .update(tableContexts)
      .set({ deletedAt: Date.now() })
      .where(eq(tableContexts.tableId, tableId));

    return { result: "Table vacated", status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Update Error", status: 500 };
  }
};

export const updateTable = async (
  db: QueryDB.DB,
  query: AdminTable.Update,
): Promise<ControllerResult<TableResponse.Update>> => {
  const { tableId, tableOptions } = query;

  try {
    await db
      .update(Schema.tables)
      .set({ name: tableOptions.name, seats: tableOptions.seats })
      .where(eq(Schema.tables.id, tableId));

    return { result: "Table updated", status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Update Error", status: 500 };
  }
};

export const getTables = async (
  db: QueryDB.DB,
): Promise<ControllerResult<TableResponse.Get>> => {
  try {
    const result = await db.query.tables.findMany({
      with: {
        tableContexts: {
          with: {
            orders: {
              with: {
                payment: true,
                menuOrders: true,
              },
            },
          },
        },
      },
    });

    return { result, status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Select Error", status: 500 };
  }
};
