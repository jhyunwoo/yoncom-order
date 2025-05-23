import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import useTableStore from "~/stores/table.store";
import * as Schema from "db/schema";
import OrderInstance from "./order.instance";
import { Divide } from "lucide-react";
import OrderDetailModal from "./order.detail.modal";
import * as TableResponse from "shared/api/types/responses/table";

export default function Orders() {
  const [orderDetail, setOrderDetail] = useState<TableResponse.AdminGet["result"][number]["tableContexts"][number]["orders"][number] | null>(null);
  const [orderDetailModalOpenState, setOrderDetailModalOpenState] = useState(false);

  const { tables } = useTableStore();
  const orders = tables
    .filter((table) => table.tableContexts[0]?.deletedAt === null)
    .flatMap((table) => table.tableContexts[0].orders);
  const inProgressOrders = orders.filter((order) => (
    order.deletedAt === null
    && order.menuOrders.some((menuOrder) => menuOrder.status === Schema.menuOrderStatus.PENDING))
  ).sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div className="full p-2">
      <Card className="full bg-[#F2F2F2] px-3 fc rounded-3xl">
        <CardHeader className="px-2">
          <CardTitle className="text-2xl">주문 현황</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-scroll *:hover:cursor-pointer">
          {inProgressOrders.map((order) => 
            <OrderInstance 
              key={order.id} 
              order={order} 
              onClick={() => {
                setOrderDetail(order);
                setOrderDetailModalOpenState(true);
              }}
            />
          )}
        </CardContent>
      </Card>
      {orderDetail && (
        <OrderDetailModal
          order={orderDetail}
          openState={orderDetailModalOpenState}
          setOpenState={setOrderDetailModalOpenState}
        />
      )}
    </div>
  );
}