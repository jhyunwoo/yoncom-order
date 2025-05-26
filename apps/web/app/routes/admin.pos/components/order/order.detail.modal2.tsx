import { Button } from "~/components/ui/button";
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { DialogContent } from "~/components/ui/dialog";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import useMenuStore from "~/stores/menu.store";
import * as TableResponse from "shared/api/types/responses/table";
import { useModal } from "~/hooks/use-modal";
import PosModal from "~/components/custom/pos-modal";

export default function OrderDetailModal2({
  modalHook,
  order,
}: {
  modalHook: ReturnType<typeof useModal>;
  order: TableResponse.AdminGet["result"][number]["tableContexts"][number]["orders"][number] | null;
}) {
  if (!order) return null;
  
  const { menus } = useMenuStore();

  const menuOrderInfos = order.menuOrders.map((menuOrder) => {
    const menu = menus.find((menu) => menu.id === menuOrder.menuId);
    console.error("menu not found", menuOrder.menuId, menus);
    return {
      menuId: menu?.id,
      menuName: menu?.name,
      menuPrice: menu?.price,
      quantity: menuOrder.quantity,
      totalPrice: (menu?.price ?? 0) * menuOrder.quantity,
    }
  })

  const handleCancelOrder = async () => {
    modalHook.close();
  };
  const handlePurchaseOrder = async () => {
    modalHook.close();
  };
  const handleClose = async () => {
    modalHook.close();
  };

  return (
    <>
      <PosModal modalHook={modalHook}>
        <DialogHeader className="fc items-start w-fit">
          <DialogTitle className="text-2xl">주문 정보</DialogTitle>
          <DialogDescription className="fc">
            <div><span className="font-bold">id</span>: {order.id}</div>
            <div><span className="font-bold">일시</span>: {new Date(order.createdAt).toLocaleString()}</div>
            <div><span className="font-bold">결제 상태</span>: {order.payment.paid ? "결제 완료 → 조리 중" : "결제 대기"}</div>
          </DialogDescription>
        </DialogHeader>
        <Table className="w-full">
          <TableHeader className="bg-gray-200">
            <TableRow>
              <TableHead className="!text-left font-bold">메뉴</TableHead>
              <TableHead className="!text-right">단가</TableHead>
              <TableHead className="!text-right">수량</TableHead>
              <TableHead className="!text-right">가격</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuOrderInfos.map((menuOrderInfo) => (
              <TableRow key={menuOrderInfo!.menuId} className="h-14 *:text-base">
                <TableCell className="text-left font-bold">{menuOrderInfo!.menuName}</TableCell>
                <TableCell className="text-right">{menuOrderInfo.menuPrice?.toLocaleString()}</TableCell>
                <TableCell className="text-right">{menuOrderInfo.quantity}</TableCell>
                <TableCell className="text-right">{menuOrderInfo.totalPrice?.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="text-left mr-4 w-full h-fit fr justify-end items-end">
          <span className="text-left text-lg mr-2">총액</span>
          <span className="text-left text-2xl font-bold">
            {menuOrderInfos.reduce((acc, menuOrderInfo) => acc + (menuOrderInfo.totalPrice ?? 0), 0).toLocaleString()} 원
          </span>
        </div>
        <DialogFooter className="w-full h-fit fr justify-end items-end">
          <div className="w-fit *:mx-1">
            <Button className="dangerBG dangerB" onClick={handleCancelOrder}>주문 취소</Button>
            {!order.payment.paid && (
              <Button className="dangerBG dangerB" onClick={handlePurchaseOrder}>결제</Button>
            )}
            <Button onClick={handleClose}>닫기</Button>
          </div>
        </DialogFooter>
      </PosModal>
    </>
  )
}