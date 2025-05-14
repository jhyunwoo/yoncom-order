
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { DialogContent } from "~/components/ui/dialog";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import useCartStore from "~/stores/cart.store";
import useMenuStore from "~/stores/menu.store";

export default function OrderModal({
  openState, setOpenState,
}: {
  openState: boolean;
  setOpenState: (open: boolean) => void;
}) {
  const { menus } = useMenuStore();
  const { menuOrders } = useCartStore();

  const menuOrderInfos = menuOrders.map((menuOrder) => {
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

  if (
    menuOrderInfos.length === 0
    || menuOrderInfos.some((menuOrderInfo) => menuOrderInfo === null)
  ) return <h1>주문 정보가 잘못되었습니다</h1>

  const handleConfirm = () => {
    setOpenState(false);
  }
  const handleClose = () => {
    setOpenState(false);
  }

  return (
    <Dialog open={openState} onOpenChange={setOpenState}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>주문 확인</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>번호</TableHead>
              <TableHead>메뉴</TableHead>
              <TableHead>단가</TableHead>
              <TableHead>수량</TableHead>
              <TableHead>가격</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuOrderInfos.map((menuOrderInfo, index) => (
              <TableRow key={menuOrderInfo!.menuId}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{menuOrderInfo!.menuName}</TableCell>
                <TableCell>{menuOrderInfo!.menuPrice.toLocaleString()}</TableCell>
                <TableCell>{menuOrderInfo!.quantity}</TableCell>
                <TableCell>{menuOrderInfo!.totalPrice.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="text-right">총 가격</TableCell>
              <TableCell className="text-right">
                {menuOrderInfos.reduce((acc, menuOrderInfo) => acc + menuOrderInfo!.totalPrice, 0).toLocaleString()}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
        <DialogFooter className="fr *:flex-1 *:mx-2 *:h-14 *:rounded-2xl">
          <Button variant="outline" onClick={handleClose}>취소</Button>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleConfirm}>주문하기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}