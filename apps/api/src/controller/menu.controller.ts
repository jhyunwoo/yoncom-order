import * as QueryDB from "api/lib/queryDB";
import { isNull } from "drizzle-orm";
import { menus } from "db/schema";
import * as ClientMenuRequest from "shared/types/requests/client/menu";
import * as ClientMenuResponse from "shared/types/responses/client/menu";
import ControllerResult from "api/types/controller";

export const getMenus = async (
  db: QueryDB.DB,
  query: ClientMenuRequest.Get
): Promise<ControllerResult<ClientMenuResponse.Get>> => {
  const { } = query;
  
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
