import * as QueryDB from "api/lib/queryDB";
import * as ClientOrderResponse from "shared/types/responses/client/order";
import ControllerResult from "api/types/controller";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import {
  menuOrders,
  menus,
  orders,
  payments,
  tableContexts,
  tables,
} from "db/schema";
import * as ClientOrderRequest from "shared/types/requests/client/order";

export const createOrder = async (
  db: QueryDB.DB,
  query: ClientOrderRequest.Create,
): Promise<ControllerResult<ClientOrderResponse.Create>> => {
  const { tableId, menuOrders: menuOrdersData } = query;

  try {
    // 해당 테이블 존재 여부 확인
    console.log("Checking table existence");
    const table = await db.query.tables.findFirst({
      where: and(eq(tables.id, tableId), isNull(tables.deletedAt)),
    });
    if (!table) return { error: "Table Not Found", status: 409 };

    // 해당 테이블에 활성 context가 없다면 occupy
    console.log("Checking table context existence");
    let tableContextsData = await db.query.tableContexts.findFirst({
      where: and(
        eq(tableContexts.tableId, table.id),
        isNull(tableContexts.deletedAt),
      ),
    });
    if (!tableContextsData) {
      console.log("Creating new table context");
      tableContextsData = (
        await db.insert(tableContexts).values({ tableId }).returning()
      )[0];
    }

    // 활성화되어있는 tableContext에 미결제 주문이 존재하는지
    console.log("Checking unfinished orders");
    const checkUnpaidOrder = await db.query.tableContexts.findFirst({
      where: and(
        eq(tableContexts.id, tableContextsData.id),
        isNull(tableContexts.deletedAt),
      ),
      with: {
        orders: {
          where: isNull(orders.deletedAt),
          with: {
            payment: true,
          },
        },
      },
    });
    console.log(checkUnpaidOrder);
    if (checkUnpaidOrder) {
      for (const order of checkUnpaidOrder?.orders) {
        console.log(order.payment);
        if (order.payment && !order.payment.paid) {
          return { error: "Unpaid Order Exists", status: 409 };
        }
      }
    }

    // 주문에 들어온 메뉴가 모두 존재하는지 확인
    console.log("Checking menu existence");
    const menuIds = menuOrdersData.map((menuOrder) => menuOrder.menuId);

    const menuData = await db.query.menus.findMany({
      where: and(inArray(menus.id, menuIds), isNull(menus.deletedAt)),
    });

    if (menuData.length !== menuIds.length)
      return { error: "Menu Not Found", status: 409 };

    // 주문 들어온 메뉴의 수량이 남은 메뉴 수량을 안넘는지 확인
    console.log("Checking menu quantity");
    const orderedMenuData = await db.query.menuOrders.findMany({
      where: and(inArray(menuOrders.id, menuIds), isNull(menuOrders.deletedAt)),
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
    // 메뉴 수량 업데이트
    for (const menu of menuData) {
      await db.update(menus).set({
        quantity: sql`${menus.quantity} - ${menu.quantity}`,
      });
    }

    // order 생성
    console.log("Creating order");
    const order = (
      await db
        .insert(orders)
        .values({ tableContextId: tableContextsData.id })
        .returning()
    )[0];

    // menuOrders 생성
    console.log("Creating menu orders");
    await db.insert(menuOrders).values(
      menuOrdersData.map((menuOrder) => ({
        ...menuOrder,
        orderId: order.id,
      })),
    );

    // payment 생성
    console.log("Creating payment");
    await db.insert(payments).values({
      orderId: order.id,
      amount:
        menuOrdersData.reduce(
          (acc, menuOrder) =>
            acc +
            menuOrder.quantity *
              menuData.find((menu) => menu.id === menuOrder.menuId)?.price!,
          0,
        ) - table.key,
      paid: false,
    });

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
      with: {
        menuOrders: true,
        payment: true,
      },
    });
    if (!ordersData) return { error: "Order Not Found", status: 403 };

    return { result: ordersData, status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Query Error", status: 500 };
  }
};

export const getOrder = async (
  db: QueryDB.DB,
  query: ClientOrderRequest.Get,
): Promise<ControllerResult<ClientOrderResponse.Get>> => {
  const { orderId, tableId } = query;

  try {
    const findTableContext = await db.query.tableContexts.findFirst({
      where: and(
        eq(tableContexts.tableId, tableId),
        isNull(tableContexts.deletedAt),
      ),
    });
    const orderData = await db.query.orders.findMany({
      where: and(
        eq(orders.id, orderId),
        eq(orders.tableContextId, findTableContext?.id!),
      ),
      with: {
        menuOrders: true,
        payment: true,
      },
    });
    if (!orderData) return { error: "Order Not Found", status: 403 };

    return {
      result: orderData as unknown as ClientOrderResponse.Get["result"],
      status: 200,
    };
  } catch (e) {
    console.error(e);
    return { error: "DB Query Error", status: 500 };
  }
};

export const removeOrder = async (
  db: QueryDB.DB,
  query: ClientOrderRequest.Remove,
): Promise<ControllerResult<ClientOrderResponse.Remove>> => {
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
    if (orderData.payment && orderData.payment.paid) {
      return { error: "Paid Order Cannot Be Deleted", status: 403 };
    }

    for (const menuOrder of orderData?.menuOrders || []) {
      await db.update(menus).set({
        quantity: sql`${menus.quantity} + ${menuOrder.quantity}`,
      });
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
