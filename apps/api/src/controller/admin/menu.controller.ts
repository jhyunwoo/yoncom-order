import { eq } from "drizzle-orm";
import * as Schema from "db/schema";
import * as QueryDB from "api/lib/queryDB";
import * as AdminMenuRequest from "shared/types/requests/admin/menu";
import * as AdminMenuResponse from "shared/types/responses/admin/menu";
import ControllerResult from "api/types/controller";

export const create = async (
  db: QueryDB.DB,
  userId: string,
  query: AdminMenuRequest.Create
): Promise<ControllerResult<AdminMenuResponse.Create>> => {
  const { menuOptions } = query;
  try {
    const user = (await QueryDB.queryUsers(db, [userId]))[0];
    const menuCategory = (await QueryDB.queryMenuCategories(db, [menuOptions.menuCategoryId]))[0];

    // 메뉴 카테고리가 존재하는지
    if (!menuCategory || menuCategory.deletedAt !== null)
      return { error: "Menu Category Not Found", status: 409 };

    // 유저가 추가하려는 메뉴의 메뉴 카테고리 소유자가 맞는지
    const isMenuCategoryOwnedByUser = QueryDB.isMenuCategoriesOwnedByUser(user, [menuCategory]);
    if (!isMenuCategoryOwnedByUser)
      return { error: "Menu Category Not Found", status: 403 };

    await db
      .insert(Schema.menus)
      .values(menuOptions);

    return { result: "Menu Created", status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Insert Error", status: 500 };
  }
}

export const update = async (
  db: QueryDB.DB,
  userId: string,
  query: AdminMenuRequest.Update
): Promise<ControllerResult<AdminMenuResponse.Update>> => {
  const { menuId, menuOptions } = query;
  try {
    const user = (await QueryDB.queryUsers(db, [userId], { menuCategories: true }))[0];
    const menu = (await QueryDB.queryMenus(db, [menuId])).at(0);
    if (!menu)
      return { error: "Menu Not Found", status: 403 };

    if (menu.menuCategoryId !== menuOptions.menuCategoryId) {
      // 메뉴의 카테고리를 옮기는 상황
      // 유저에게 옮기려는 목적 메뉴 카테고리가 있는지 확인
      const dstMenuCategory = (await QueryDB.queryMenuCategories(db, [menuOptions.menuCategoryId]))[0];
      const isDstMenuCategoryOwnedByUser = QueryDB.isMenuCategoriesOwnedByUser(user, [dstMenuCategory]);
      if (!isDstMenuCategoryOwnedByUser)
        return { error: "Menu Category Not Found", status: 403 };
    }

    // 유저가 메뉴 소유자가 맞는지
    const isMenuOwnedByUser = QueryDB.isMenusOwnedByUser(user, [menu]);
    if (!isMenuOwnedByUser)
      return { error: "Menu Not Found", status: 403 };

    await db
      .update(Schema.menus)
      .set(menuOptions)
      .where(eq(Schema.menus.id, menuId));
      
    return { result: "Menu Updated", status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Update Error", status: 500 };
  }
}

export const remove = async (
  db: QueryDB.DB,
  userId: string,
  query: AdminMenuRequest.Remove
): Promise<ControllerResult<AdminMenuResponse.Remove>> => {
  const { menuId } = query;

  try {
    const user = (await QueryDB.queryUsers(db, [userId], { menuCategories: true }))[0];
    const menu = (await QueryDB.queryMenus(db, [menuId])).at(0);
    if (!menu)
      return { error: "Menu Not Found", status: 403 };

    // 유저가 메뉴 소유자가 맞는지
    const isMenuOwnedByUser = QueryDB.isMenusOwnedByUser(user, [menu]);
    if (!isMenuOwnedByUser)
      return { error: "Menu Not Found", status: 403 };

    await db
      .update(Schema.menus)
      .set({ deletedAt: Date.now() })
      .where(eq(Schema.menus.id, menuId));
      
    return { result: "Menu Removed", status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Delete Error", status: 500 };
  }
}

export const get = async (
  db: QueryDB.DB,
  userId: string,
  query: AdminMenuRequest.Get
): Promise<ControllerResult<AdminMenuResponse.Get>> => {
  const { } = query;
  
  try {
    const user = (await QueryDB.queryUsers(db, [userId], { menuCategories: true }))[0];
    const data = await Promise.all(
      user.menuCategories
        .filter((menuCategory) => menuCategory.deletedAt === null)
        .map(async (menuCategory) => ({ 
          ...menuCategory, 
          menus: (await QueryDB.queryMenuCategories(db, [menuCategory], { menus: true }))[0].menus
        }))
    );

    return { result: data, status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Query Error", status: 500 };
  }
}