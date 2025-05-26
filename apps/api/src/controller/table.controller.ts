import * as QueryDB from "api/lib/queryDB";
import { GetTable, OccupyTable } from "shared/api/types/requests/table";
import { and, eq, isNull } from "drizzle-orm";
import { orders, tableContexts, tables } from "db/schema";

export const occupyTable = async (db: QueryDB.DB, query: OccupyTable) => {
  const { tableId } = query;

  try {
    const table = await db.query.tables.findFirst({
      where: eq(tables.id, tableId),
    });

    if (!table) return { error: "Table Not Found", status: 409 };

    // 해당 테이블이 활성화 중인지 확인
    const isTableActive = await db.query.tableContexts.findFirst({
      where: and(
        eq(tableContexts.tableId, table.id),
        isNull(tableContexts.deletedAt),
      ),
      columns: {
        id: true,
      },
    });

    if (isTableActive)
      return { error: "Table is already occupied", status: 409 };

    await db.insert(tableContexts).values({ tableId });

    return { result: "Table occupied", status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Insert Error", status: 500 };
  }
};

export const getTable = async (db: QueryDB.DB, query: GetTable) => {
  const { tableId } = query;

  try {
    const table = (
      await QueryDB.queryTables(db, [tableId], { tableContexts: true })
    )[0];
    if (!table) return { error: "Table Not Found", status: 409 };

    // 활성화 table context가 있다면 해당 내역을 같이 첨부.
    // 없다면 비활성화된 table context는 보여주면 안되므로 빈 배열 첨부
    const tableData = await db.query.tables.findFirst({
      where: eq(tables.id, tableId),
      with: {
        tableContexts: {
          where: isNull(tables.deletedAt),
          with: {
            orders: {
              where: isNull(orders.deletedAt),
            },
          },
        },
      },
    });

    return {
      result: tableData,
      status: 200,
    };
  } catch (e) {
    console.error(e);
    return { error: "DB Select Error", status: 500 };
  }
};
