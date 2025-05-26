import { eq } from "drizzle-orm";
import * as Schema from "db/schema";
import * as QueryDB from "api/lib/queryDB";
import * as ClientTableRequest from "shared/types/requests/client/table";
import * as ClientTableResponse from "shared/types/responses/client/table";
import ControllerResult from "api/types/controller";

export const get = async (
  db: QueryDB.DB,
  query: ClientTableRequest.Get
): Promise<ControllerResult<ClientTableResponse.Get>> => {
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
    const orders = (
      await QueryDB.queryOrders(db, tableContextWithOrders.orders, { menuOrders: true, payment: true })
    ).filter((order) => order.deletedAt === null);
    
    return { 
      result: { ...table, tableContexts: [{ ...activeTableContext, orders }] },
      status: 200 
    };

  } catch (e) {
    console.error(e);
    return { error: "DB Select Error", status: 500 };
  }
}