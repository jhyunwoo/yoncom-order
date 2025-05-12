import { eq } from "drizzle-orm";
import * as Schema from "db/schema";
import * as QueryDB from "api/lib/queryDB";
import * as MenuCategoryRequest from "shared/api/types/requests/menuCategory";
import * as MenuCategoryResponse from "shared/api/types/responses/menuCategory";
import ControllerResult from "api/types/controller";

export const create = async (
  db: QueryDB.DB,
  userId: string,
  query: MenuCategoryRequest.CreateQuery
): Promise<ControllerResult<MenuCategoryResponse.Create>> => {
  const { menuCategoryOptions } = query;

  try {
    const user = (await QueryDB.queryUsers(db, [userId], { menuCategories: true }))[0];

    // 메뉴 카테고리 이름 중복 체크
    if (user.menuCategories
        .filter((menuCategory) => menuCategory.deletedAt === null)
        .some((menuCategory) => menuCategory.name === menuCategoryOptions.name)
      ) return { error: "Menu Category name already exists", status: 409 };

    await db
      .insert(Schema.menuCategories)
      .values({ ...menuCategoryOptions, userId });

    return { result: "MenuCategory created", status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Insert Error", status: 500 };
  }
}

export const remove = async (
  db: QueryDB.DB,
  userId: string,
  query: MenuCategoryRequest.DeleteQuery
): Promise<ControllerResult<MenuCategoryResponse.Remove>> => {
  const { menuCategoryId } = query;

  try {
    const user = (await QueryDB.queryUsers(db, [userId], { menuCategories: true }))[0];
    const menuCategory = (await QueryDB.queryMenuCategories(db, [menuCategoryId]))[0];

    // 메뉴 카테고리가 존재하는지
    if (!menuCategory || menuCategory.deletedAt !== null)
      return { error: "Menu Category Not Found", status: 409 };

    // 유저가 메뉴 카테고리 소유자가 맞는지
    const isMenuCategoryOwnedByUser = QueryDB.isMenuCategoriesOwnedByUser(user, [menuCategory]);
    if (!isMenuCategoryOwnedByUser)
      return { error: "Menu Category Not Found", status: 409 };

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
    return { error: "DB Delete Error", status: 500 };
  }
}

export const update = async (
  db: QueryDB.DB,
  userId: string,
  query: MenuCategoryRequest.UpdateQuery
): Promise<ControllerResult<MenuCategoryResponse.Update>> => {
  const { menuCategoryId, menuCategoryOptions } = query;

  try {
    const user = (await QueryDB.queryUsers(db, [userId], { menuCategories: true }))[0];
    const menuCategory = (await QueryDB.queryMenuCategories(db, [menuCategoryId]))[0];

    // 유저가 메뉴 카테고리 소유자가 맞는지
    const isMenuCategoryOwnedByUser = QueryDB.isMenuCategoriesOwnedByUser(user, [menuCategory]);
    if (!isMenuCategoryOwnedByUser)
      return { error: "Menu Category Not Found", status: 409 };  

    // 메뉴 카테고리 이름 중복 체크
    if (user.menuCategories
      .filter((menuCategory) => menuCategory.id !== menuCategoryId)
      .filter((menuCategory) => menuCategory.deletedAt === null)
      .some((menuCategory) => menuCategory.name === menuCategoryOptions.name)
    ) return { error: "Menu Category name already exists", status: 409 };
    
    await db
      .update(Schema.menuCategories)
      .set(menuCategoryOptions)
      .where(eq(Schema.menuCategories.id, menuCategoryId));

    return { result: "MenuCategory updated", status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Update Error", status: 500 };
  }
}