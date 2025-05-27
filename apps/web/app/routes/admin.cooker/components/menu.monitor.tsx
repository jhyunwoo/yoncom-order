import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import useTableStore from "~/stores/table.store";
import useMenuStore from "~/stores/menu.store";
import MenuInstance from "./menu.instance";

export default function MenuMonitor({
  menuId,
}: {
  menuId: string;
}) {
  const { menus } = useMenuStore();
  const { tables } = useTableStore();

  const menu = menus.find((menu) => menu.id === menuId)!;

  const menuOrders = tables
    .flatMap((table) => ({
      orders: table.tableContexts[0]?.orders || [],
      tableName: table.name,
    }))
    .flatMap(({ orders, tableName }) => orders
        .filter((order) => order.payment.paid)
        .flatMap(
          (order) => order.menuOrders
            .filter(menuOrder => menuOrder.menuId === menuId)
            .map(menuOrder => ({ ...menuOrder, timestamp: order.createdAt })),
        ).map((menuOrder) => ({
          menuId: menu.id,
          menuName: menu.name,
          menuPrice: menu.price,
          quantity: menuOrder.quantity,
          status: menuOrder.status,
          tableName,
          timestamp: menuOrder.timestamp,
        })),
    );

  return (
    <div className="full p-2">
      <Card className="full bg-[#F2F2F2] px-3 fc rounded-3xl">
        <CardHeader className="px-2">
          <CardTitle className="text-2xl">{menu.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto *:hover:cursor-pointer">
          {menuOrders.map((order) => 
            <MenuInstance 
              key={order.timestamp} 
              order={order} 
              onClick={() => {}}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}