import * as QueryDB from "api/lib/queryDB";
import { isNull } from "drizzle-orm";
import { menuCategories } from "db/schema";
import * as ClientMenuRequest from "shared/types/requests/client/menu";
import * as ClientMenuResponse from "shared/types/responses/client/menu";
import ControllerResult from "api/types/controller";

export const getMenus = async (
  db: QueryDB.DB,
  query: ClientMenuRequest.Get,
): Promise<ControllerResult<ClientMenuResponse.Get>> => {
  const {} = query;

  try {
    const menus = await db.query.menuCategories.findMany({
      where: isNull(menuCategories.deletedAt),
      with: {
        menus: true,
      },
    });

    return {
      result: menus,
      status: 200,
    };
  } catch (e) {
    console.error(e);
    return { error: "DB Query Error", status: 500 };
  }
};
