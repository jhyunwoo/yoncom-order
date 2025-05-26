import { eq } from "drizzle-orm";
import * as Schema from "db/schema";
import * as QueryDB from "api/lib/queryDB";
import * as ClientMenuRequest from "types/requests/client/menu";
import * as ClientMenuResponse from "types/responses/client/menu";
import ControllerResult from "api/types/controller";

export const get = async (
  db: QueryDB.DB,
  query: ClientMenuRequest.Get
): Promise<ControllerResult<ClientMenuResponse.Get>> => {
  const { userId } = query;
  
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