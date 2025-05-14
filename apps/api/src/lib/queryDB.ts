import { DrizzleD1Database } from "drizzle-orm/d1";
import { and, eq, isNull, inArray, asc, desc } from "drizzle-orm";
import * as Schema from "db/schema";

export type DB = DrizzleD1Database<typeof import("db/schema")> & {
  $client: D1Database;
};

type WithUser<T extends { user?: true }> = T["user"] extends true
  ? { user: Schema.User }
  : {};
type WithTable<T extends { table?: true }> = T["table"] extends true
  ? { table: Schema.Table }
  : {};
type WithTables<T extends { tables?: true }> = T["tables"] extends true
  ? { tables: Schema.Table[] }
  : {};
type WithTableContext<T extends { tableContext?: true }> =
  T["tableContext"] extends true ? { tableContext: Schema.TableContext } : {};
type WithTableContexts<T extends { tableContexts?: true }> =
  T["tableContexts"] extends true
    ? { tableContexts: Schema.TableContext[] }
    : {};
type WithMenuCategory<T extends { menuCategory?: true }> =
  T["menuCategory"] extends true ? { menuCategory: Schema.MenuCategory } : {};
type WithMenuCategories<T extends { menuCategories?: true }> =
  T["menuCategories"] extends true
    ? { menuCategories: Schema.MenuCategory[] }
    : {};
type WithMenu<T extends { menu?: true }> = T["menu"] extends true
  ? { menu: Schema.Menu }
  : {};
type WithMenus<T extends { menus?: true }> = T["menus"] extends true
  ? { menus: Schema.Menu[] }
  : {};
type WithOrder<T extends { order?: true }> = T["order"] extends true
  ? { order: Schema.Order }
  : {};
type WithOrders<T extends { orders?: true }> = T["orders"] extends true
  ? { orders: Schema.Order[] }
  : {};
type WithMenuOrder<T extends { menuOrder?: true }> = T["menuOrder"] extends true
  ? { menuOrder: Schema.MenuOrder }
  : {};
type WithMenuOrders<T extends { menuOrders?: true }> =
  T["menuOrders"] extends true ? { menuOrders: Schema.MenuOrder[] } : {};
type WithPayment<T extends { payment?: true }> = T["payment"] extends true
  ? { payment: Schema.Payment }
  : {};

type QueryUserOption = {
  tables?: true;
  menuCategories?: true;
  includeDeleted?: true;
};
type QueryUserResult<T extends QueryUserOption> = (Schema.User &
  WithTables<T> &
  WithMenuCategories<T>)[];
export const queryUsers = async <T extends QueryUserOption>(
  db: DB,
  users: (Schema.User | string)[],
  option?: T
): Promise<QueryUserResult<T>> => {
  const userIds = users.map((user) =>
    typeof user === "string" ? user : user.id
  );
  const { tables, menuCategories, includeDeleted } = option ?? {};

  return await db.query.users.findMany({
    where: and(
      inArray(Schema.users.id, userIds),
      includeDeleted ? undefined : isNull(Schema.users.deletedAt)
    ),
    with: { tables, menuCategories },
  });
};

type QueryMenuCategoryOption = {
  user?: true;
  menus?: true;
  includeDeleted?: true;
};
type QueryMenuCategoryResult<T extends QueryMenuCategoryOption> =
  (Schema.MenuCategory & WithUser<T> & WithMenus<T>)[];
export const queryMenuCategories = async <T extends QueryMenuCategoryOption>(
  db: DB,
  menuCategories: (Schema.MenuCategory | string)[],
  option?: T
): Promise<QueryMenuCategoryResult<T>> => {
  const menuCategoryIds = menuCategories.map((menuCategory) =>
    typeof menuCategory === "string" ? menuCategory : menuCategory.id
  );
  const { user, menus, includeDeleted } = option ?? {};

  return await db.query.menuCategories.findMany({
    where: and(
      inArray(Schema.menuCategories.id, menuCategoryIds),
      includeDeleted ? undefined : isNull(Schema.menuCategories.deletedAt)
    ),
    with: { user, menus },
  });
};

type QueryMenuOption = {
  menuCategory?: true;
  menuOrders?: true;
  includeDeleted?: true;
};
type QueryMenuResult<T extends QueryMenuOption> = (Schema.Menu &
  WithMenuCategory<T> &
  WithMenuOrders<T>)[];
export const queryMenus = async <T extends QueryMenuOption>(
  db: DB,
  menus: (Schema.Menu | string)[],
  option?: T
): Promise<QueryMenuResult<T>> => {
  const menuIds = menus.map((menu) =>
    typeof menu === "string" ? menu : menu.id
  );
  const { menuCategory, menuOrders, includeDeleted } = option ?? {};

  return await db.query.menus.findMany({
    where: and(
      inArray(Schema.menus.id, menuIds),
      includeDeleted ? undefined : isNull(Schema.menus.deletedAt)
    ),
    with: { menuCategory, menuOrders },
  });
};

type QueryTableOption = {
  user?: true;
  tableContexts?: true;
  includeDeleted?: true;
  limit?: number;
};
type QueryTableResult<T extends QueryTableOption> = (Schema.Table &
  WithUser<T> &
  WithTableContexts<T>)[];
export const queryTables = async <T extends QueryTableOption>(
  db: DB,
  tables: (Schema.Table | string)[],
  option?: T
): Promise<QueryTableResult<T>> => {
  const tableIds = tables.map((table) =>
    typeof table === "string" ? table : table.id
  );
  const { user, tableContexts, includeDeleted, limit } = option ?? {};
  const DEFAULT_LIMIT = 5;

  const result = await db.query.tables
    .findMany({
      where: and(
        inArray(Schema.tables.id, tableIds),
        includeDeleted ? undefined : isNull(Schema.tables.deletedAt)
      ),
      with: { user, tableContexts },
    })
    .then(async (tables) => {
      if (!tableContexts) return tables;
      return await Promise.all(
        tables.map(async (table) => ({
          ...table,
          tableContexts: await db.query.tableContexts.findMany({
            where: eq(Schema.tableContexts.tableId, table.id),
            limit: limit ?? DEFAULT_LIMIT,
          }),
        }))
      );
    });

  return result;
};

type QueryTableContextOption = {
  table?: true;
  orders?: true;
  onlyActive?: true;
  order?: "asc";
};
type QueryTableContextResult<T extends QueryTableContextOption> =
  (Schema.TableContext & WithTable<T> & WithOrders<T>)[];
export const queryTableContexts = async <T extends QueryTableContextOption>(
  db: DB,
  tableContexts: (Schema.TableContext | string)[],
  option?: T
): Promise<QueryTableContextResult<T>> => {
  const tableContextIds = tableContexts.map((tableContext) =>
    typeof tableContext === "string" ? tableContext : tableContext.id
  );
  const { table, orders, onlyActive, order } = option ?? {};

  return await db.query.tableContexts.findMany({
    where: and(
      inArray(Schema.tableContexts.id, tableContextIds),
      onlyActive ? isNull(Schema.tableContexts.deletedAt) : undefined
    ),
    with: { table, orders },
    orderBy: order
      ? asc(Schema.tableContexts.createdAt)
      : desc(Schema.tableContexts.createdAt),
  });
};

type QueryOrderOption = {
  tableContext?: true;
  menuOrders?: true;
  payment?: true;
  onlyActive?: true;
  order?: "asc";
};
type QueryOrderResult<T extends QueryOrderOption> = (Schema.Order &
  WithTableContext<T> &
  WithMenuOrders<T> &
  WithPayment<T>)[];
export const queryOrders = async <T extends QueryOrderOption>(
  db: DB,
  orders: (Schema.Order | string)[],
  option?: T
): Promise<QueryOrderResult<T>> => {
  const orderIds = orders.map((order) =>
    typeof order === "string" ? order : order.id
  );
  const { tableContext, menuOrders, onlyActive, order, payment } = option ?? {};

  if (!onlyActive)
    return (await db.query.orders.findMany({
      where: inArray(Schema.orders.id, orderIds),
      with: { tableContext, menuOrders, payment },
      orderBy: order
        ? asc(Schema.orders.createdAt)
        : desc(Schema.orders.createdAt),
    })) as unknown as QueryOrderResult<T>;

  const result = (
    await db.query.orders.findMany({
      where: inArray(Schema.orders.id, orderIds),
      with: { tableContext, menuOrders: true },
      orderBy: order
        ? asc(Schema.orders.createdAt)
        : desc(Schema.orders.createdAt),
    })
  ).filter((order) =>
    isOrdersOnActivate([order])
  ) as unknown as QueryOrderResult<T>;

  if (menuOrders) return result as unknown as QueryOrderResult<T>;
  else
    return orders.map((order) => ({
      ...result,
      menuOrders: undefined,
    })) as unknown as QueryOrderResult<T>;
};

type QueryMenuOrderOption = {
  order?: true;
  menu?: true;
  onlyActive?: true;
  orderBy?: "asc";
};
type QueryMenuOrderResult<T extends QueryMenuOrderOption> = (Schema.MenuOrder &
  WithOrder<T> &
  WithMenu<T>)[];
export const queryMenuOrders = async <T extends QueryMenuOrderOption>(
  db: DB,
  menuOrders: (Schema.MenuOrder | string)[],
  option?: T
): Promise<QueryMenuOrderResult<T>> => {
  const menuOrderIds = menuOrders.map((menuOrder) =>
    typeof menuOrder === "string" ? menuOrder : menuOrder.id
  );
  const { order, menu, onlyActive } = option ?? {};

  return await db.query.menuOrders.findMany({
    where: and(
      inArray(Schema.menuOrders.id, menuOrderIds),
      onlyActive
        ? eq(Schema.menuOrders.status, Schema.menuOrderStatus.PENDING)
        : undefined
    ),
    with: { order, menu },
    orderBy: order
      ? asc(Schema.menuOrders.createdAt)
      : desc(Schema.menuOrders.createdAt),
  });
};

export const isMenusOwnedByMenuCategory = (
  menuCategory: Schema.MenuCategory,
  menus: Schema.Menu[]
) => {
  return !menus.some((menu) => menu.menuCategoryId !== menuCategory.id);
};

export const isMenuCategoriesOwnedByUser = (
  user: Schema.User,
  menuCategories: Schema.MenuCategory[]
) => {
  return !menuCategories.some(
    (menuCategory) => menuCategory.userId !== user.id
  );
};

export const isMenusOwnedByUser = (
  user: Schema.User & { menuCategories: Schema.MenuCategory[] },
  menus: Schema.Menu[]
) => {
  const menuCategoryIds = user.menuCategories.map(
    (menuCategory) => menuCategory.id
  );
  return !menus.some((menu) => !menuCategoryIds.includes(menu.menuCategoryId));
};

export const isTablesOwnedByUser = (
  user: Schema.User,
  tables: Schema.Table[]
) => {
  return !tables.some((table) => table.userId !== user.id);
};

export const isTableContextsOnActivate = (
  tableContexts: Schema.TableContext[]
) => {
  return tableContexts.some((tableContext) => tableContext.deletedAt === null);
};

export const isTableContextsOnDeactivate = (
  tableContexts: Schema.TableContext[]
) => {
  return tableContexts.some((tableContext) => tableContext.deletedAt !== null);
};

// deletedAt === null 이면 활성화되어 있음
// recentTableContext === undefined 이면 비활성화되어 있음
// 이외의 경우 비활성화되어 있음

export const isTablesOnActivate = (
  tables: (Schema.Table & { tableContexts: Schema.TableContext[] })[]
) => {
  return !tables.some((table) => {
    const recentTableContext = table.tableContexts
      .sort((a, b) => b.createdAt - a.createdAt)
      .at(0);
    return recentTableContext?.deletedAt !== null;
  });
};

export const isTablesOnDeactivate = (
  tables: (Schema.Table & { tableContexts: Schema.TableContext[] })[]
) => {
  return !tables.some((table) => {
    const recentTableContext = table.tableContexts
      .sort((a, b) => b.createdAt - a.createdAt)
      .at(0);
    console.debug(recentTableContext?.deletedAt === null);
    return recentTableContext?.deletedAt === null;
  });
};

export const isMenuOrdersOnActivate = (menuOrders: Schema.MenuOrder[]) => {
  return !menuOrders.some(
    (menuOrder) => menuOrder.status !== Schema.menuOrderStatus.PENDING
  );
};

export const isMenuOrdersOnDeactivate = (menuOrders: Schema.MenuOrder[]) => {
  return !menuOrders.some(
    (menuOrder) => menuOrder.status === Schema.menuOrderStatus.PENDING
  );
};

export const isOrdersOnActivate = (
  orders: (Schema.Order & { menuOrders: Schema.MenuOrder[] })[]
) => {
  return !orders.some((order) => isMenuOrdersOnDeactivate(order.menuOrders));
};

export const isOrdersOnDeactivate = (
  orders: (Schema.Order & { menuOrders: Schema.MenuOrder[] })[]
) => {
  return !orders.some((order) => isMenuOrdersOnActivate(order.menuOrders));
};

export const chooseActiveTableContext = (
  tableContexts: Schema.TableContext[]
) => {
  return tableContexts
    .filter((tableContext) => isTableContextsOnActivate([tableContext]))
    .at(0);
};
