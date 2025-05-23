
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { DialogContent } from "~/components/ui/dialog";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import useMenuStore from "~/stores/menu.store";
import * as TableResponse from "shared/api/types/responses/table";

export default function OrderDetailModal({
  openState, setOpenState,
  order,
}: {
  openState: boolean;
  setOpenState: (open: boolean) => void;
  order: TableResponse.AdminGet["result"][number]["tableContexts"][number]["orders"][number];
}) {
  const { menuCategories, menus } = useMenuStore();

  const menuOrderInfos = order.menuOrders.map((menuOrder) => {
    const menu = menus.find((menu) => menu.id === menuOrder.menuId);

    if (!menu) return null;
    return {
      menuId: menuOrder.menuId,
      menuName: menu.name,
      menuPrice: menu.price,
      quantity: menuOrder.quantity,
      totalPrice: menu.price * menuOrder.quantity,
    }
  })

  const handleClose = () => {
    setOpenState(false);
  }

  return (
    <>
      <Dialog open={openState} onOpenChange={setOpenState}>
        <DialogContent className="fc w-[96%] min-h-[25rem] max-h-[40rem] justify-between rounded-xl">
          <DialogHeader className="fc items-start">
            <DialogTitle className="text-2xl">주문 정보</DialogTitle>
            <DialogDescription className="fc">
              <div><span className="font-bold">id</span>: {order.id}</div>
              <div><span className="font-bold">일시</span>: {new Date(order.createdAt).toLocaleString()}</div>
              <div><span className="font-bold">결제 상태</span>: {order.payment.paid ? "결제 완료" : "결제 대기"}</div>
            </DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader className="bg-gray-200">
              <TableRow>
                {/* <TableHead></TableHead> */}
                <TableHead className="!text-left font-bold">메뉴</TableHead>
                <TableHead className="!text-right">단가</TableHead>
                <TableHead className="!text-right">수량</TableHead>
                <TableHead className="!text-right">가격</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuOrderInfos.map((menuOrderInfo) => (
                <TableRow
                  key={menuOrderInfo!.menuId}
                  className="h-14 *:text-base"
                >
                  {/* <TableCell className="text-center">{index + 1}</TableCell> */}
                  <TableCell className="text-left font-bold">{menuOrderInfo!.menuName}</TableCell>
                  <TableCell className="text-right">{menuOrderInfo!.menuPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{menuOrderInfo!.quantity}</TableCell>
                  <TableCell className="text-right">{menuOrderInfo!.totalPrice.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <DialogFooter className="h-fit fr justify-between items-end">
            <div className="text-left flex-1">
              <span className="text-left text-lg mr-2">총액</span>
              <span className="text-left text-2xl font-bold">
                {menuOrderInfos.reduce((acc, menuOrderInfo) => acc + menuOrderInfo!.totalPrice, 0).toLocaleString()} 원
              </span>
            </div>
            <div className="w-fit *:h-14 *:rounded-2xl *:text-lg">
              <Button className="mx-2 w-[8rem]" onClick={handleClose}>닫기</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}