import * as Schema from "db/schema";
import * as QueryDB from "api/lib/queryDB";
import * as OrderResponse from "shared/api/types/responses/order";
import ControllerResult from "api/types/controller";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { menuOrders, orders, payments, tableContexts, tables } from "db/schema";
import { CreateOrder, DeleteOrder } from "shared/api/types/requests/order";

export const createOrder = async (
  db: QueryDB.DB,
  query: CreateOrder,
): Promise<ControllerResult<OrderResponse.Create>> => {
  const { tableId, menuOrders: menuOrdersData } = query;

  try {
    // 해당 테이블 존재 여부 확인
    const table = await db.query.tables.findFirst({
      where: eq(tables.id, tableId),
    });
    if (!table) return { error: "Table Not Found", status: 409 };

    // 해당 테이블에 활성 context가 없다면 occupy
    const isTablesOnActivate = await db.query.tableContexts.findFirst({
      where: and(
        eq(tableContexts.tableId, table.id),
        isNull(tableContexts.deletedAt),
      ),
    });
    if (!isTablesOnActivate) {
      await db.insert(tableContexts).values({ tableId });
    }
    // 활성화되어있는 tableContext에 미결제 주문이 존재하는지
    const tableContextsData = await db.query.tableContexts.findFirst({
      where: and(
        eq(tableContexts.tableId, table.id),
        isNull(tableContexts.deletedAt),
      ),
      with: {
        orders: {
          where: and(isNull(orders.deletedAt), eq(payments.paid, false)),
          with: {
            payment: true,
          },
        },
      },
    });

    if (!tableContextsData) {
      return { error: "Table Context Not Found", status: 409 };
    }

    for (const order of tableContextsData?.orders) {
      if (order.payment && !order.payment.paid) {
        return { error: "Unpaid Order Exists", status: 409 };
      }
    }

    // 주문에 들어온 메뉴가 모두 존재하는지 확인
    const menuIds = menuOrdersData.map((menuOrder) => menuOrder.menuId);
    const menuData = await db.query.menus.findMany({
      where: inArray(Schema.menus.id, menuIds),
    });

    if (menuData.length !== menuIds.length)
      return { error: "Menu Not Found", status: 409 };

    // 주문 들어온 메뉴의 수량이 남은 메뉴 수량을 안넘는지 확인
    const orderedMenuData = await db.query.menuOrders.findMany({
      where: inArray(menuOrders.id, menuIds),
    });

    const soldMenuData = orderedMenuData.map((menu) =>
      orderedMenuData
        .filter((orderedMenu) => orderedMenu.menuId === menu.id)
        .reduce((acc, curr) => acc + curr.quantity, 0),
    );

    for (const index in menuData) {
      if (
        soldMenuData[index] + menuOrdersData[index].quantity >
        menuData[index].quantity
      )
        return { error: "Menu Not Enough", status: 409 };
    }

    // order 생성
    const order = (
      await db
        .insert(orders)
        .values({ tableContextId: tableContextsData.id })
        .returning()
    )[0];

    // menuOrders 생성
    await db.insert(menuOrders).values(
      menuOrdersData.map((menuOrder) => ({
        ...menuOrder,
        orderId: order.id,
      })),
    );

    // payment 생성
    const payment = (
      await db
        .insert(payments)
        .values({
          orderId: order.id,
          amount: menuOrdersData.reduce(
            (acc, menuOrder) =>
              acc +
              menuOrder.quantity *
                menuData.find((menu) => menu.id === menuOrder.menuId)?.price!,
            0,
          ),
          paid: false,
        })
        .returning()
    )[0];

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

export const getOrders = async (db: QueryDB.DB, tableId: string) => {
  try {
    const findTableContext = await db.query.tableContexts.findFirst({
      where: and(
        eq(tableContexts.tableId, tableId),
        isNull(tableContexts.deletedAt),
      ),
    });
    if (!findTableContext)
      return { error: "Table Context Not Found", status: 403 };

    const ordersData = await db.query.orders.findMany({
      where: eq(orders.tableContextId, findTableContext.id),
    });
    if (!ordersData) return { error: "Order Not Found", status: 403 };

    return { result: ordersData, status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Query Error", status: 500 };
  }
};

export const getOrder = async (db: QueryDB.DB, orderId: string) => {
  try {
    const orderData = await db.query.orders.findMany({
      where: eq(orders.id, orderId),
    });
    if (!orderData) return { error: "Order Not Found", status: 403 };

    return { result: orderData, status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Query Error", status: 500 };
  }
};

export const deleteOrder = async (
  db: QueryDB.DB,
  query: DeleteOrder,
): Promise<ControllerResult<OrderResponse.Delete>> => {
  const { orderId } = query;

  try {
    const orderData = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        payment: true,
        menuOrders: true,
      },
    });
    if (!orderData) return { error: "Order Not Found", status: 403 };
    if (orderData.payment && !orderData.payment.paid) {
      return { error: "Unpaid Order Cannot Be Deleted", status: 403 };
    }

    // menuOrders 삭제
    await Promise.all([
      db
        .update(menuOrders)
        .set({ deletedAt: new Date().getTime() })
        .where(
          inArray(
            menuOrders.id,
            orderData.menuOrders.map((menuOrder) => menuOrder.id),
          ),
        ),
      db
        .update(payments)
        .set({ deletedAt: new Date().getTime() })
        .where(eq(payments.id, orderData.payment?.id!)),
      db
        .update(orders)
        .set({ deletedAt: new Date().getTime() })
        .where(eq(orders.id, orderId)),
    ]);
    return { result: "Order Deleted", status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Update Error", status: 500 };
  }
};
