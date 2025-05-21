
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import useMenuStore from "~/stores/menu.store";
import useTableStore from "~/stores/table.store";
import * as TableResponse from "shared/api/types/responses/table";
import { dateDiffString } from "~/lib/date";
import { useEffect, useState } from "react";
import * as Schema from "db/schema";

export default function OrderInstance({ order }: { order: TableResponse.AdminGet["result"][number]["tableContexts"][number]["orders"][number] }) {
  const [now, setNow] = useState(0);

  const { tables } = useTableStore();
  const { menus } = useMenuStore();
  const table = tables.find((table) => table.tableContexts.some((tableContext) => tableContext.id === order.tableContextId));
  const tableContext = table!.tableContexts.find((tableContext) => tableContext.id === order.tableContextId);
  console.debug("tableContext", tableContext);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <Card className="rounded-3xl my-3">
        <CardHeader className="py-2 rounded-t-3xl fr justify-between" style={{
            background: "linear-gradient(to right, #323232, #FFFFFF)",
          }}>
          <CardTitle className="text-white">{table!.name}</CardTitle>
          <div className="!-m-1 !p-0">{
            dateDiffString(now, order.createdAt).startsWith("-") 
              ? "00:00" 
              : dateDiffString(now, order.createdAt)
          }</div>
        </CardHeader>
        <CardContent className="fr px-4 py-1 items-end">
          <ul className="flex-1">
            {order.menuOrders.map((menuOrder) => {
              const menu = menus.find((menu) => menu.id === menuOrder.menuId);
              const status = menuOrder.status === Schema.menuOrderStatus.PENDING ? "⌛"
                : menuOrder.status === Schema.menuOrderStatus.SERVED ? "✅"
                : "❌"; // 취소됨

              return (
                <li key={menuOrder.menuId} className="text-sm my-1">
                  {status} {menu!.name} x{menuOrder.quantity}
                </li>
              )
            })}
          </ul>
          <span className="w-fit font-bold my-1">{order.payment?.paid ? "조리 중" : "결제 대기"}</span>
        </CardContent>
      </Card>
    </>
  )
}