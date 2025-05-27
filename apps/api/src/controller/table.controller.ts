import * as QueryDB from "api/lib/queryDB";
import * as ClientTableRequest from "shared/types/requests/client/table";
import { eq, isNull } from "drizzle-orm";
import { orders, tables } from "db/schema";

export const getTable = async (
  db: QueryDB.DB,
  query: ClientTableRequest.Get,
) => {
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
