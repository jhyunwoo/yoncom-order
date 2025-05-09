import { DrizzleD1Database } from "drizzle-orm/d1";
import * as Schema from "~/db/schema";
import { sql, and, eq, isNull, inArray, asc, desc } from "drizzle-orm";

export const queryUsers = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  userIds: string[],
  option: {
    withTables?: true,
    withMenuCategories?: true,
    includeDeleted?: true,
  }
): Promise<(typeof Schema.users.$inferSelect & {
  tables: typeof Schema.tables.$inferSelect[] | string[],
  menuCategories: typeof Schema.menuCategories.$inferSelect[] | string[],
})[]> => {
  const { withTables, withMenuCategories, includeDeleted } = option;

  return await db.query.users.findMany({ 
    where: and(
      inArray(Schema.users.id, userIds), 
      includeDeleted ? undefined : isNull(Schema.users.deletedAt)
    ),  
    with: {
      tables: withTables,
      menuCategories: withMenuCategories,
    }
  });
}

export const queryMenuCategories = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  menuCategoryIds: string[],
  option: {
    withUser?: true,
    withMenus?: true,
    includeDeleted?: true,
  }
) => {
  const { withUser, withMenus, includeDeleted } = option;

  return await db.query.menuCategories.findMany({
    where: and(
      inArray(Schema.menuCategories.id, menuCategoryIds), 
      includeDeleted ? undefined : isNull(Schema.menuCategories.deletedAt)
    ),
    with: {
      user: withUser,
      menus: withMenus,
    }
  });
}

export const queryMenus = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  menuIds: string[],
  option: {
    withMenuCategory?: true,
    withMenuOrders?: true,
    includeDeleted?: true,
  }
) => {
  const { withMenuCategory, withMenuOrders, includeDeleted } = option;

  return await db.query.menus.findMany({
    where: and(
      inArray(Schema.menus.id, menuIds),
      includeDeleted ? undefined : isNull(Schema.menus.deletedAt)
    ),
    with: {
      menuCategory: withMenuCategory,
      menuOrders: withMenuOrders,
    }
  });
}

export const queryTables = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  tableIds: string[],
  option: {
    withUser?: true,
    withTableContexts?: true,
    includeDeleted?: true,
  }
) => {
  const { withUser, withTableContexts, includeDeleted } = option;

  return await db.query.tables.findMany({
    where: and(
      inArray(Schema.tables.id, tableIds), 
      includeDeleted ? undefined : isNull(Schema.tables.deletedAt)
    ),
    with: {
      user: withUser,
      tableContexts: withTableContexts,
    }
  });
}

export const queryTableContexts = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  tableContextIds: string[],
  option: {
    withTable?: true,
    withOrders?: true,
    onlyActive?: true,
    order?: "asc",
  }
): Promise<(typeof Schema.tableContexts.$inferSelect & {
  table: typeof Schema.tables.$inferSelect | string,
  orders: typeof Schema.orders.$inferSelect[] | string[],
})[]> => {
  const { withTable, withOrders, onlyActive, order } = option;

  return await db.query.tableContexts.findMany({
    where: and(
      inArray(Schema.tableContexts.id, tableContextIds),
      onlyActive ? isNull(Schema.tableContexts.deletedAt) : undefined,
      order ? asc(Schema.tableContexts.createdAt) : desc(Schema.tableContexts.createdAt)
    ),
    with: {
      table: withTable,
      orders: withOrders,
    },
  });
}

export const queryOrders = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  orderIds: string[],
  option: {
    withTableContext?: true,
    withMenuOrders?: true,
    onlyActive?: true,
    order?: "asc",
  }
) => {
  const { withTableContext, withMenuOrders, onlyActive, order } = option;

  const orders = await db.query.orders.findMany({
    where: inArray(Schema.orders.id, orderIds),
    with: {
      tableContext: withTableContext,
      menuOrders: (withMenuOrders || onlyActive) ? true : undefined,
    },
    orderBy: order ? asc(Schema.orders.createdAt) : desc(Schema.orders.createdAt),
  });

  return orders.filter((order) => {
    return order.menuOrders.some((menuOrder) => {
      return onlyActive
        ? menuOrder.status === Schema.menuOrderStatus.PENDING
        : true
    })
  }).map((order) => {
    return withMenuOrders
      ? order
      : {
        ...order,
        menuOrders: order.menuOrders.map((menuOrder) => menuOrder.id)
      } 
  })
}

export const queryMenuOrders = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  menuOrderIds: string[],
  option: {
    withOrder?: true,
    withMenu?: true,
    onlyActive?: true,
  }
): Promise<(typeof Schema.menuOrders.$inferSelect & {
  order: typeof Schema.orders.$inferSelect | string,
  menu: typeof Schema.menus.$inferSelect | string,
})[]> => {
  const { withOrder, withMenu, onlyActive } = option;
  return await db.query.menuOrders.findMany({
    where: and(
      inArray(Schema.menuOrders.id, menuOrderIds),
      onlyActive ? eq(Schema.menuOrders.status, Schema.menuOrderStatus.PENDING) : undefined,
    ),
    with: {
      order: withOrder,
      menu: withMenu,
    },
  });
}

export const isMenusOwnedByMenuCategory = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  menuCategoryId: string,
  menuIds: string[],
) => {
  const menus = await queryMenus(db, menuIds, { withMenuCategory: true });
  return !menus.some((menu) => menu.menuCategoryId !== menuCategoryId)
}

export const isMenuCategoriesOwnedByUser = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  userId: string,
  menuCategoryIds: string[],
) => {
  const menuCategories = await queryMenuCategories(db, menuCategoryIds, {});
  return !menuCategories.some((menuCategory) => menuCategory.userId !== userId)
}

export const isMenusOwnedByUser = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  userId: string,
  menuIds: string[],
) => {
  const menus = await queryMenus(db, menuIds, {});
  const menuCategoryIds = menus.map((menu) => menu.menuCategoryId);
  const menuCategories = await queryMenuCategories(db, menuCategoryIds, {});
  return !menuCategories.some((menuCategory) => menuCategory.userId !== userId)
}

export const isTablesOwnedByUser = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  userId: string,
  tableIds: string[],
) => {
  const tables = await queryTables(db, tableIds, {});
  return !tables.some((table) => table.userId !== userId)
}

export const isTableContextsActive = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  tableContextIds: string[],
) => {
  const tableContexts = await queryTableContexts(db, tableContextIds, { onlyActive: true });
  return tableContexts.length > 0;
}

export const isTablesActive = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  tableIds: string[],
) => {
  const tables = await queryTables(db, tableIds, {});
  return tables.some(async (table) => {
    const recentTableContext = await queryTableContexts(db, [table.tableContexts[0].id], { onlyActive: true });
    return recentTableContext.length > 0;
  });
}

export const isMenuOrdersActive = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  menuOrderIds: string[],
) => {
  const menuOrders = await queryMenuOrders(db, menuOrderIds, {});
  return menuOrders.some((menuOrder) => menuOrder.status !== Schema.menuOrderStatus.CANCELLED);
}

export const isOrdersActive = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  orderIds: string[],
) => {
  const orders = await queryOrders(db, orderIds, {});
  return orders.some((order) => isMenuOrdersActive(db, order.menuOrders as string[]));
}
