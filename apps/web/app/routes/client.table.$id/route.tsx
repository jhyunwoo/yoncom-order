import { LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import useTableStore from "~/stores/table.store";
import Header from "./components/header";
import Menus from "./components/menu/menus";
import ShopIntro from "./components/shop.intro";
import Footer from "./components/footer";
import useMenuStore from "~/stores/menu.store";
import { useEffect } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "테이블" },
    { name: "description", content: "테이블" }
  ];
};

export const loader: LoaderFunction = async ({ params }) => {
  const tableId = params.id ?? "";
  const table = (await useTableStore.getState().clientGetTable({ tableId }))?.result;
  const menuCategories = (await useMenuStore.getState().clientLoad({}))?.result;
  return { table, menuCategories };
};

export default function Client() {
  const { table } = useLoaderData<typeof loader>();
  const { clientTable } = useTableStore();
  const { clientMenuCategories } = useMenuStore();

  useEffect(() => {
    if (table) {
      useTableStore.getState().clientGetTable({ tableId: table.id });
      useMenuStore.getState().clientLoad({ userId: table.userId });
    }
  }, [table])

  return (
    <div className="w-[100vw] h-[100vh] fc items-center justify-center overflow-hidden">
      {clientTable && clientMenuCategories
        ? (
          <>
            <Header />
            <div className="w-full flex-1 max-w-[600px] fc px-2 overflow-hidden">
              <ShopIntro tableName={clientTable.name} tableSeats={clientTable.seats} />
              <Menus menuCategories={clientMenuCategories} />
              <Footer />
            </div>
          </>
        ) : <h1>존재하지 않는 테이블입니다.</h1>
      }
    </div>
  );
}