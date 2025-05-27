import * as QueryDB from "api/lib/queryDB";
import { eq, isNull } from "drizzle-orm";
import { menuCategories, menus } from "db/schema";
import { Create, Remove, Update } from "shared/types/requests/admin/menu";

export const adminGetMenus = async (db: QueryDB.DB) => {
  try {
    const menuCategoryPromise = db.query.menuCategories.findMany({
      where: isNull(menuCategories.deletedAt),
    });

    const menuPromise = db.query.menus.findMany();

    const [menuCategoriesData, menusData] = await Promise.all([
      menuCategoryPromise,
      menuPromise,
    ]);

    return {
      result: { menuCategories: menuCategoriesData, menus: menusData },
      status: 200,
    };
  } catch (e) {
    console.error(e);
    return { error: "DB Query Error", status: 500 };
  }
};

export const adminGetMenu = async (db: QueryDB.DB, menuId: string) => {
  try {
    const menuData = await db.query.menus.findFirst({
      where: eq(menus.id, menuId),
    });
    if (!menuData) {
      return { error: "Menu not found", status: 404 };
    }

    const menuCategoryData = await db.query.menuCategories.findFirst({
      where: eq(menuCategories.id, menuData.menuCategoryId),
    });

    return {
      result: { menuCategory: menuCategoryData, menu: menuData },
      status: 200,
    };
  } catch (e) {
    console.error(e);
    return { error: "DB Query Error", status: 500 };
  }
};

export const adminCreateMenu = async (db: QueryDB.DB, data: Create) => {
  const { menuOptions } = data;
  try {
    const newMenu = await db.insert(menus).values(menuOptions).returning();
    return { result: newMenu, status: 201 };
  } catch (e) {
    console.error(e);
    return { error: "DB Insert Error", status: 500 };
  }
};

export const adminUpdateMenu = async (db: QueryDB.DB, data: Update) => {
  const { menuId, menuOptions } = data;
  try {
    const updateMenu = await db
      .update(menus)
      .set(menuOptions)
      .where(eq(menus.id, menuId))
      .returning();
    return { result: updateMenu, status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Insert Error", status: 500 };
  }
};

export const adminDeleteMenu = async (db: QueryDB.DB, data: Remove) => {
  const { menuId } = data;
  try {
    await db
      .update(menus)
      .set({ deletedAt: new Date().getTime() })
      .where(eq(menus.id, menuId));
    return { result: "Menu deleted successfully", status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Delete Error", status: 500 };
  }
};
