import { sql, and, eq, isNull, inArray, or } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { ContentfulStatusCode } from "hono/utils/http-status";
import * as Schema from "db/schema";
import { createMenuValidation, updateMenuValidation, deleteMenuValidation, getMenuValidation } from "api/lib/validations";
import { z } from "zod";
import * as QueryDB from "api/lib/queryDB";

type DB = DrizzleD1Database<typeof import("db/schema")> & { $client: D1Database; };

export const create = async (
  db: DB,
  userId: string,
  query: z.infer<typeof createMenuValidation>
): Promise<{ result: string; status: ContentfulStatusCode }> => {
  const { menuOptions } = query;
  try {
    const user = (await QueryDB.queryUsers(db, [userId]))[0];
    const menuCategory = (await QueryDB.queryMenuCategories(db, [menuOptions.menuCategoryId]))[0];

    // 유저가 추가하려는 메뉴의 메뉴 카테고리 소유자가 맞는지
    const isMenuCategoryOwnedByUser = QueryDB.isMenuCategoriesOwnedByUser(user, [menuCategory]);
    if (!isMenuCategoryOwnedByUser)
      return { result: "Menu Category Not Found", status: 403 };

    await db
      .insert(Schema.menus)
      .values(menuOptions);

    return { result: "Menu Created", status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Insert Error", status: 500 };
  }
}

export const update = async (
  db: DB,
  userId: string,
  query: z.infer<typeof updateMenuValidation>
): Promise<{ result: string; status: ContentfulStatusCode }> => {
  const { menuId, menuOptions } = query;
  try {
    const user = (await QueryDB.queryUsers(db, [userId], { menuCategories: true }))[0];
    const menu = (await QueryDB.queryMenus(db, [menuId])).at(0);
    if (!menu)
      return { result: "Menu Not Found", status: 403 };

    if (menu.menuCategoryId !== menuOptions.menuCategoryId) {
      // 메뉴의 카테고리를 옮기는 상황
      // 유저에게 옮기려는 목적 메뉴 카테고리가 있는지 확인
      const dstMenuCategory = (await QueryDB.queryMenuCategories(db, [menuOptions.menuCategoryId]))[0];
      const isDstMenuCategoryOwnedByUser = QueryDB.isMenuCategoriesOwnedByUser(user, [dstMenuCategory]);
      if (!isDstMenuCategoryOwnedByUser)
        return { result: "Menu Category Not Found", status: 403 };
    }

    // 유저가 메뉴 소유자가 맞는지
    const isMenuOwnedByUser = QueryDB.isMenusOwnedByUser(user, [menu]);
    if (!isMenuOwnedByUser)
      return { result: "Menu Not Found", status: 403 };

    await db
      .update(Schema.menus)
      .set(menuOptions)
      .where(eq(Schema.menus.id, menuId));
      
    return { result: "Menu Updated", status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Update Error", status: 500 };
  }
}

export const remove = async (
  db: DB,
  userId: string,
  query: z.infer<typeof deleteMenuValidation>
): Promise<{ result: string; status: ContentfulStatusCode }> => {
  const { menuId } = query;

  try {
    const user = (await QueryDB.queryUsers(db, [userId], { menuCategories: true }))[0];
    const menu = (await QueryDB.queryMenus(db, [menuId])).at(0);
    if (!menu)
      return { result: "Menu Not Found", status: 403 };

    // 유저가 메뉴 소유자가 맞는지
    const isMenuOwnedByUser = QueryDB.isMenusOwnedByUser(user, [menu]);
    if (!isMenuOwnedByUser)
      return { result: "Menu Not Found", status: 403 };

    await db
      .update(Schema.menus)
      .set({ deletedAt: Date.now() })
      .where(eq(Schema.menus.id, menuId));
      
    return { result: "Menu Removed", status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Delete Error", status: 500 };
  }
}

export const get = async (
  db: DB,
  query: z.infer<typeof getMenuValidation>
): Promise<{ 
  result: (Schema.MenuCategory & {
    menus: Schema.Menu[]
  })[] | string, 
  status: ContentfulStatusCode 
}> => {
  const { userId, menuCategoryIds } = query;
  
  try {
    const user = (await QueryDB.queryUsers(db, [userId], { menuCategories: true }))[0];
    const data = await Promise.all(
      user.menuCategories
        .filter((menuCategory) => menuCategoryIds === undefined || menuCategoryIds.includes(menuCategory.id))
        .map(async (menuCategory) => ({ 
          ...menuCategory, 
          menus: (await QueryDB.queryMenuCategories(db, [menuCategory], { menus: true }))[0].menus
        }))
    );

    return { result: data, status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Query Error", status: 500 };
  }
}