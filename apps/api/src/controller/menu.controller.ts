import * as QueryDB from "api/lib/queryDB";
import { isNull } from "drizzle-orm";
import { menus } from "db/schema";

export const getMenus = async (db: QueryDB.DB) => {
  try {
    const menusPromise = await db.query.menus.findMany({
      where: isNull(menus.deletedAt),
      with: {
        menuCategory: true,
      },
    });
    const menuCategoriesPromise = await db.query.menuCategories.findMany({
      where: isNull(menus.deletedAt),
    });
    const [menusData, menuCategoriesData] = await Promise.all([
      menusPromise,
      menuCategoriesPromise,
    ]);

    return {
      result: { menus: menusData, menuCategories: menuCategoriesData },
      status: 200,
    };
  } catch (e) {
    console.error(e);
    return { error: "DB Query Error", status: 500 };
  }
};
