import * as QueryDB from "api/lib/queryDB";
import { eq, isNull } from "drizzle-orm";
import { menuCategories, menus } from "db/schema";

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

export const adminCreateMenu = async (
  db: QueryDB.DB,
  data: typeof menus.$inferInsert,
) => {
  try {
    const newMenu = await db.insert(menus).values(data).returning();
    return { result: newMenu, status: 201 };
  } catch (e) {
    console.error(e);
    return { error: "DB Insert Error", status: 500 };
  }
};

export const adminUpdateMenu = async (
  db: QueryDB.DB,
  data: typeof menus.$inferInsert,
  menuId: string,
) => {
  try {
    const updateMenu = await db
      .update(menus)
      .set(data)
      .where(eq(menus.id, menuId))
      .returning();
    return { result: updateMenu, status: 200 };
  } catch (e) {
    console.error(e);
    return { error: "DB Insert Error", status: 500 };
  }
};

export const adminDeleteMenu = async (db: QueryDB.DB, menuId: string) => {
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
