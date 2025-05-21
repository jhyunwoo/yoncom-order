
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import useCartStore from "~/stores/cart.store";
import * as MenuResponse from "shared/api/types/responses/menu";

export default function OrderConfirmModal({
  openState, setOpenState,
  setPurchaseModalOpenState,
}: {
  openState: boolean;
  setOpenState: (open: boolean) => void;
  setPurchaseModalOpenState: (open: boolean) => void;
}) {
  const { purchaseMenuOrders } = useCartStore();

  const handleConfirm = async () => {
    purchaseMenuOrders();
    handleClose();
    setPurchaseModalOpenState(true);
  }

  const handleClose = () => {
    setOpenState(false);
  }

  return (
    <Dialog open={openState} onOpenChange={handleClose}>
      <DialogContent className="w-[96%] border-blue-500 border-2 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">주문을 진행할까요?</DialogTitle>
          <DialogDescription className="fc text-md !mt-4 *:my-2">
            <span>⋅ 꼭! 제공드리는 토스 링크를 통해서 <b className="dangerTXT">금액을 절대 변경하지 말고</b> 입금해주세요.</span>
            <span>⋅ 입금 전까지 다른 주문이 불가하며, <b className="dangerTXT">5분 동안 입금되지 않을 경우 주문이 자동취소</b>됩니다.</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="fr *:flex-1 *:mx-2 *:h-14 *:rounded-2xl *:text-lg">
          <Button variant="outline" onClick={handleClose}>취소</Button>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleConfirm}>주문하기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  );
}