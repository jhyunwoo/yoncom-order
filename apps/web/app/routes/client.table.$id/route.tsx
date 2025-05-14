import { LoaderFunction } from "@remix-run/node";
import queryStore from "~/lib/query";
import * as TableRequest from "shared/api/types/requests/table";
import * as TableResponse from "shared/api/types/responses/table";
import * as MenuRequest from "shared/api/types/requests/menu";
import * as MenuResponse from "shared/api/types/responses/menu";
import { useLoaderData } from "@remix-run/react";
import useTableStore from "~/stores/table.store";
import Header from "./components/header";
import Menus from "./components/menus";
import ShopIntro from "./components/shop.intro";
import Footer from "./components/footer";
import useMenuStore from "~/stores/menu.store";
import { useEffect } from "react";

export const loader: LoaderFunction = async ({ params }) => {
  const tableId = params.id ?? "";
  const table = (await useTableStore.getState().clientGetTable({ tableId }))?.result;
  const menuCategories = (await useMenuStore.getState().clientLoad({ userId: table?.userId ?? "" }))?.result;
  return { table, menuCategories };
};

export default function Client() {
  const { table } = useLoaderData<typeof loader>();
  const { clientTable } = useTableStore();
  const { clientMenuCategories } = useMenuStore();

  useEffect(() => {
    if (table) {
      useTableStore.getState().clientGetTable({ tableId: table.id});
      useMenuStore.getState().clientLoad({ userId: table.userId });
    }
  }, [table])

  return (
    <div className="screen fc items-center justify-center overflow-hidden">
      <Header />
      {clientTable && clientMenuCategories 
        ? (
          <div className="w-full flex-1 max-w-[600px] fc px-2 overflow-hidden">
              <ShopIntro tableName={clientTable.name} tableSeats={clientTable.seats} />
              <Menus menuCategories={clientMenuCategories} />
              <Footer onClick={() => {}} />
            </div>
        ) : <h1>존재하지 않는 테이블입니다.</h1>
      }
    </div>
  );
}