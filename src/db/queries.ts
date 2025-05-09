import { DrizzleD1Database } from "drizzle-orm/d1";
import * as Schema from "~/db/schema";
import { sql, and, eq, isNull, inArray, asc, desc } from "drizzle-orm";

export const queryUsers = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  userIds: string[],
  withTables: boolean = false,
  withMenuCategories: boolean = false,
  includeDeleted: boolean = false,
): Promise<(typeof Schema.users.$inferSelect & {
  tables: typeof Schema.tables.$inferSelect[] | string[],
  menuCategories: typeof Schema.menuCategories.$inferSelect[] | string[],
})[]> => {
  return await db.query.users.findMany({ 
    where: and(
      inArray(Schema.users.id, userIds), 
      includeDeleted ? undefined : isNull(Schema.users.deletedAt)
    ),  
    with: {
      tables: withTables ? true : undefined,
      menuCategories: withMenuCategories ? true : undefined,
    }
  });
}

export const queryMenuCategories = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  menuCategoryIds: string[],
  withUser: boolean = false,
  withMenus: boolean = false,
  includeDeleted: boolean = false,
) => {
  return await db.query.menuCategories.findMany({
    where: and(
      inArray(Schema.menuCategories.id, menuCategoryIds), 
      includeDeleted ? undefined : isNull(Schema.menuCategories.deletedAt)
    ),
    with: {
      user: withUser ? true : undefined,
      menus: withMenus ? true : undefined,
    }
  });
}

export const queryMenus = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  menuIds: string[],
  withMenuCategory: boolean = false,
  withMenuOrders: boolean = false,
  includeDeleted: boolean = false,
) => {
  return await db.query.menus.findMany({
    where: and(
      inArray(Schema.menus.id, menuIds),
      includeDeleted ? undefined : isNull(Schema.menus.deletedAt)
    ),
    with: {
      menuCategory: withMenuCategory ? true : undefined,
      menuOrders: withMenuOrders ? true : undefined,
    }
  });
}

export const queryTables = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  tableIds: string[],
  withUser: boolean = false,
  withTableContexts: boolean = false,
  includeDeleted: boolean = false,  
) => {
  return await db.query.tables.findMany({
    where: and(
      inArray(Schema.tables.id, tableIds), 
      includeDeleted ? undefined : isNull(Schema.tables.deletedAt)
    ),
    with: {
      user: withUser ? true : undefined,
      tableContexts: withTableContexts ? true : undefined,
    }
  });
}

export const queryTableContexts = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  tableContextIds: string[],
  withTable: boolean = false,
  withOrders: boolean = false,
  onlyActive: boolean = false,
  order: "asc" | "desc" = "desc",
): Promise<(typeof Schema.tableContexts.$inferSelect & {
  table: typeof Schema.tables.$inferSelect | string,
  orders: typeof Schema.orders.$inferSelect[] | string[],
})[]> => {
  return await db.query.tableContexts.findMany({
    where: and(
      inArray(Schema.tableContexts.id, tableContextIds),
      onlyActive ? isNull(Schema.tableContexts.deletedAt) : undefined,
      order === "asc" ? asc(Schema.tableContexts.createdAt) : desc(Schema.tableContexts.createdAt)
    ),
    with: {
      table: withTable ? true : undefined,
      orders: withOrders ? true : undefined,
    },
  });
}

export const queryOrders = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  orderIds: string[],
  withTableContext: boolean = false,
  withMenuOrders: boolean = false,
  onlyActive: boolean = false,
  order: "asc" | "desc" = "desc",
) => {
  const orders = await db.query.orders.findMany({
    where: inArray(Schema.orders.id, orderIds),
    with: {
      tableContext: withTableContext ? true : undefined,
      menuOrders: withMenuOrders ? true : undefined,
    },
    orderBy: order === "asc" ? asc(Schema.orders.createdAt) : desc(Schema.orders.createdAt),
  });

  if (!onlyActive) return orders
}

export const queryMenuOrders = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  menuOrderIds: string[],
  withOrder: boolean = false,
  withMenu: boolean = false,
  onlyActive: boolean = false,
): Promise<(typeof Schema.menuOrders.$inferSelect & {
  order: typeof Schema.orders.$inferSelect | string,
  menu: typeof Schema.menus.$inferSelect | string,
})[]> => {
  return await db.query.menuOrders.findMany({
    where: and(
      inArray(Schema.menuOrders.id, menuOrderIds),
      onlyActive ? eq(Schema.menuOrders.status, Schema.menuOrderStatus.PENDING) : undefined,
    ),
    with: {
      order: withOrder ? true : undefined,
      menu: withMenu ? true : undefined,
    },
  });
}

export const isMenusOwnedByMenuCategory = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  menuCategoryId: string,
  menuIds: string[],
) => {
  const menus = await queryMenus(db, menuIds, true);
  return !menus.some((menu) => menu.menuCategoryId !== menuCategoryId)
}

export const isMenuCategoriesOwnedByUser = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  userId: string,
  menuCategoryIds: string[],
) => {
  const menuCategories = await queryMenuCategories(db, menuCategoryIds, true, false);
  return !menuCategories.some((menuCategory) => menuCategory.userId !== userId)
}

export const isMenusOwnedByUser = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  userId: string,
  menuIds: string[],
) => {
  const menus = await queryMenus(db, menuIds);
  const menuCategoryIds = menus.map((menu) => menu.menuCategoryId);
  const menuCategories = await queryMenuCategories(db, menuCategoryIds, true, false);
  return !menuCategories.some((menuCategory) => menuCategory.userId !== userId)
}

export const isTablesOwnedByUser = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  userId: string,
  tableIds: string[],
) => {
  const tables = await queryTables(db, tableIds);
  return !tables.some((table) => table.userId !== userId)
}

export const isTableContextsActive = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  tableContextIds: string[],
) => {
  const tableContexts = await queryTableContexts(db, tableContextIds, false, false, true);
  return tableContexts.length > 0;
}

export const isTablesActive = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  tableIds: string[],
) => {
  const tables = await queryTables(db, tableIds, false, false, false);
  return tables.some(async (table) => {
    const recentTableContext = await queryTableContexts(db, [table.tableContexts[0].id], false, false, true);
    return recentTableContext.length > 0;
  });
}

export const isOrdersActive = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  orderIds: string[],
) => {
  const orders = await queryOrders(db, orderIds, false, false, false, true);
  return orders.some((order) => order.status !== Schema.orderStatus.CANCELLED);
}