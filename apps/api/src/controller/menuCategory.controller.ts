import { DrizzleD1Database } from "drizzle-orm/d1";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { createMenuCategoryValidation, deleteMenuCategoryValidation, updateMenuCategoryValidation } from "api/lib/validations";
import { z } from "zod";
import * as QueryDB from "api/lib/queryDB";
import * as Schema from "db/schema";
import { eq } from "drizzle-orm";

type DB = DrizzleD1Database<typeof import("db/schema")> & { $client: D1Database; };

export const create = async (
  db: DB,
  userId: string,
  query: z.infer<typeof createMenuCategoryValidation>
): Promise<{ result: string; status: ContentfulStatusCode }> => {
  const { menuCategoryOptions } = query;

  try {
    const user = (await QueryDB.queryUsers(db, [userId], { menuCategories: true }))[0];

    // 메뉴 카테고리 이름 중복 체크
    if (user.menuCategories
        .filter((menuCategory) => menuCategory.deletedAt === null)
        .some((menuCategory) => menuCategory.name === menuCategoryOptions.name)
      ) return { result: "Menu Category name already exists", status: 409 };

    await db
      .insert(Schema.menuCategories)
      .values({ ...menuCategoryOptions, userId });

    return { result: "MenuCategory created", status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Insert Error", status: 500 };
  }
}

export const remove = async (
  db: DB,
  userId: string,
  query: z.infer<typeof deleteMenuCategoryValidation>
): Promise<{ result: string; status: ContentfulStatusCode }> => {
  const { menuCategoryId } = query;

  try {
    const user = (await QueryDB.queryUsers(db, [userId], { menuCategories: true }))[0];
    const menuCategory = (await QueryDB.queryMenuCategories(db, [menuCategoryId]))[0];

    // 메뉴 카테고리가 존재하는지
    if (!menuCategory || menuCategory.deletedAt !== null)
      return { result: "Menu Category Not Found", status: 409 };

    // 유저가 메뉴 카테고리 소유자가 맞는지
    const isMenuCategoryOwnedByUser = QueryDB.isMenuCategoriesOwnedByUser(user, [menuCategory]);
    if (!isMenuCategoryOwnedByUser)
      return { result: "Menu Category Not Found", status: 409 };

    // 메뉴 카테고리의 모든 메뉴를 삭제 처리
    await db
      .update(Schema.menus)
      .set({ deletedAt: Date.now() })
      .where(eq(Schema.menus.menuCategoryId, menuCategoryId));

    // 메뉴 카테고리 삭제
    await db
      .update(Schema.menuCategories)
      .set({ deletedAt: Date.now() })
      .where(eq(Schema.menuCategories.id, menuCategoryId));

    return { result: "MenuCategory removed", status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Delete Error", status: 500 };
  }
}

export const update = async (
  db: DB,
  userId: string,
  query: z.infer<typeof updateMenuCategoryValidation>
): Promise<{ result: string; status: ContentfulStatusCode }> => {
  const { menuCategoryId, menuCategoryOptions } = query;

  try {
    const user = (await QueryDB.queryUsers(db, [userId], { menuCategories: true }))[0];
    const menuCategory = (await QueryDB.queryMenuCategories(db, [menuCategoryId]))[0];

    // 유저가 메뉴 카테고리 소유자가 맞는지
    const isMenuCategoryOwnedByUser = QueryDB.isMenuCategoriesOwnedByUser(user, [menuCategory]);
    if (!isMenuCategoryOwnedByUser)
      return { result: "Menu Category Not Found", status: 409 };  

    // 메뉴 카테고리 이름 중복 체크
    if (user.menuCategories
      .filter((menuCategory) => menuCategory.id !== menuCategoryId)
      .filter((menuCategory) => menuCategory.deletedAt === null)
      .some((menuCategory) => menuCategory.name === menuCategoryOptions.name)
    ) return { result: "Menu Category name already exists", status: 409 };
    
    await db
      .update(Schema.menuCategories)
      .set(menuCategoryOptions)
      .where(eq(Schema.menuCategories.id, menuCategoryId));

    return { result: "MenuCategory updated", status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Update Error", status: 500 };
  }
}