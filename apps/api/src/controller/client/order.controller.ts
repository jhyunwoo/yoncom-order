import * as Schema from "db/schema";
import * as QueryDB from "api/lib/queryDB";
import * as AdminTableController from "api/controller/admin/table.controller";
import * as ClientOrderRequest from "types/requests/client/order";
import * as ClientOrderResponse from "types/responses/client/order";
import ControllerResult from "api/types/controller";
import { eq, inArray } from "drizzle-orm";

export const create = async (
  db: QueryDB.DB,
  query: ClientOrderRequest.Create
): Promise<ControllerResult<ClientOrderResponse.Create>> => {
  const { tableId, menuOrders } = query;

  try {
    // 해당 테이블 존재 여부 확인
    const table = (
      await QueryDB.queryTables(db, [tableId], { tableContexts: true })
    )[0];
    if (!table) return { error: "Table Not Found", status: 409 };

    // 해당 테이블에 활성 context가 없다면 occupy
    const isTablesOnActivate = QueryDB.isTablesOnActivate([table]);
    if (!isTablesOnActivate)
      await AdminTableController.occupy(db, table.userId, { tableId });

    const tableContexts = (
      await QueryDB.queryTables(db, [table], { tableContexts: true })
    )[0].tableContexts;

    const activeTableContext = (
      await QueryDB.queryTableContexts(db, [QueryDB.chooseActiveTableContext(tableContexts)!.id], { orders: true })
    )[0];


    // 활성화되어있는 tableContext에 미결제 주문이 존재하는지
    const orders = await QueryDB.queryOrders(db, activeTableContext.orders, { payment: true });
    const hasUnpaidOrder = orders.some((order) => !order.payment?.paid && order.deletedAt === null);
    if (hasUnpaidOrder)
      return { error: "Unpaid Order Exists", status: 409 };

    // 주문에 들어온 메뉴가 모두 존재하는지 확인
    const menuIds = menuOrders.map((menuOrder) => menuOrder.menuId);
    const menus = (
      await QueryDB.queryMenus(db, menuIds, { menuCategory: true })
    ).filter((menu) => menu.deletedAt === null);

    if (menus.length !== menuIds.length)
      return { error: "Menu Not Found", status: 409 };

    // 주문에 들어온 메뉴가 모두 테이블 소유자의 메뉴가 맞는지 확인
    if (menus.some((menu) => menu.menuCategory.userId !== table.userId))
      return { error: "Menu Not Found", status: 409 };

    // 주문 들어온 메뉴의 수량이 남은 메뉴 수량을 안넘는지 확인
    const orderedMenuData = await db.query.menuOrders.findMany({
      where: inArray(Schema.menuOrders.menuId, menuIds),
    });

    const soldMenuData = menus.map((menu) =>
      orderedMenuData
        .filter((orderedMenu) => orderedMenu.menuId === menu.id)
        .reduce((acc, curr) => acc + curr.quantity, 0)
    );

    for (const index in menus) {
      if (
        soldMenuData[index] + menuOrders[index].quantity >
        menus[index].quantity
      )
        return { error: "Menu Not Enough", status: 409 };
    }

    // order 생성
    const order = (
      await db
        .insert(Schema.orders)
        .values({ tableContextId: activeTableContext.id })
        .returning()
    )[0];

    // menuOrders 생성
    await db.insert(Schema.menuOrders).values(
      menuOrders.map((menuOrder) => ({
        ...menuOrder,
        orderId: order.id,
        status: Schema.menuOrderStatus.PENDING,
      }))
    );

    // payment 생성
    const payment = (
      await db
        .insert(Schema.payments)
        .values({
          orderId: order.id,
          amount: menuOrders.reduce((acc, menuOrder) => acc + menuOrder.quantity * menus.find((menu) => menu.id === menuOrder.menuId)?.price!, 0),
          paid: false,
        }).returning()
    )[0];

    // 주문 가능 수량 변경
    for (const menuOrder of menuOrders) {
      const menu = menus.find((menu) => menu.id === menuOrder.menuId)!;
      await db.update(Schema.menus).set({
        quantity: menu.quantity - menuOrder.quantity
      }).where(eq(Schema.menus.id, menu.id));
    }

    await db
      .update(Schema.orders)
      .set({ paymentId: payment.id })
      .where(eq(Schema.orders.id, order.id));

    return { result: "Order Created", status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Insert Error", status: 500 };
  }
};


export const get = async (
  db: QueryDB.DB,
  query: ClientOrderRequest.Get
): Promise<ControllerResult<ClientOrderResponse.Get>> => {
  const { orderId } = query;

  try {
    const order = (
      await QueryDB.queryOrders(db, [orderId], {
        tableContext: true,
        menuOrders: true,
        payment: true,
      })
    )[0];
    if (!order) return { error: "Order Not Found", status: 403 };

    return { result: order, status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Query Error", status: 500 };
  }
};
