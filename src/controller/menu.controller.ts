import { sql, and, eq, isNull, inArray, or } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { ContentfulStatusCode } from "hono/utils/http-status";
import * as Schema from "~/db/schema";
import { createMenuValidation, updateMenuValidation, deleteMenuValidation, getMenuValidation } from "~/lib/validations";
import { z } from "zod";
import * as Q from "~/db/queries";

export const create = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  userId: string,
  query: z.infer<typeof createMenuValidation>
): Promise<{ result: string; status: ContentfulStatusCode }> => {
  const { menuOptions } = query;
  try {
    // 유저가 추가하려는 메뉴의 메뉴 카테고리 소유자가 맞는지
    const isMenuCategoryOwnedByUser = await Q.isMenuCategoriesOwnedByUser(db, userId, [menuOptions.menuCategoryId]);
    if (!isMenuCategoryOwnedByUser)
      return { result: "Menu Category Not Found", status: 404 };

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
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  userId: string,
  query: z.infer<typeof updateMenuValidation>
): Promise<{ result: string; status: ContentfulStatusCode }> => {
  const { menuId, menuOptions } = query;
  try {
    const menu = (await Q.queryMenus(db, [menuId])).at(0);
    if (!menu)
      return { result: "Menu Not Found", status: 404 };

    if (menu.menuCategoryId !== menuOptions.menuCategoryId) {
      // 메뉴의 카테고리를 옮기는 상황
      // 유저에게 옮기려는 목적 메뉴 카테고리가 있는지 확인
      const isDstMenuCategoryOwnedByUser = await Q.isMenuCategoriesOwnedByUser(db, userId, [menuOptions.menuCategoryId]);
      if (!isDstMenuCategoryOwnedByUser)
        return { result: "Menu Category Not Found", status: 404 };
    }

    // 유저가 메뉴 소유자가 맞는지
    const isMenuOwnedByUser = await Q.isMenusOwnedByUser(db, userId, [menuId]);
    if (!isMenuOwnedByUser)
      return { result: "Menu Not Found", status: 404 };

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
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  userId: string,
  query: z.infer<typeof deleteMenuValidation>
): Promise<{ result: string; status: ContentfulStatusCode }> => {
  const { menuId } = query;

  try {
    // 유저가 메뉴 소유자가 맞는지
    const isMenuOwnedByUser = await Q.isMenusOwnedByUser(db, userId, [menuId]);
    if (!isMenuOwnedByUser)
      return { result: "Menu Not Found", status: 404 };

    await db
      .update(Schema.menus)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(Schema.menus.id, menuId));
    return { result: "Menu Removed", status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Delete Error", status: 500 };
  }
}

export const get = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  query: z.infer<typeof getMenuValidation>
): Promise<{ 
  result: (typeof Schema.users.$inferSelect & {
    menuCategories: (typeof Schema.menuCategories.$inferSelect & {
      menus: typeof Schema.menus.$inferSelect[]
    })[]
  })[] | string, 
  status: ContentfulStatusCode 
}> => {
  const { userId, menuCategoryIds } = query;
  
  try {
    const users = await Q.queryUsers(db, [userId]);
    const data = await Promise.all(users
      .map((user) => {
        return {
          ...user,
          menuCategories: menuCategoryIds !== undefined 
            ? (user.menuCategories as string[]).filter((menuCategoryId) => menuCategoryIds.includes(menuCategoryId))
            : user.menuCategories,
        }
      }).map(async (user) => {
        return {
          ...user,
          menuCategories: await Q.queryMenuCategories(db, user.menuCategories as string[], false, true, false),
        }
      }));

    return { result: data, status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Query Error", status: 500 };
  }
}