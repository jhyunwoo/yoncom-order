import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { toast } from "~/hooks/use-toast";
import useTableStore from "~/stores/table.store";
import { QRCodeSVG } from "qrcode.react";
import { dateDiffString } from "~/lib/date";
import { ClipboardPasteIcon, LinkIcon, ListIcon } from "lucide-react";


export default function PurchaseModal({
  openState, setOpenState,
}: {
  openState: boolean;
  setOpenState: (open: boolean) => void;
}) {
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const { clientTable, clientGetTable } = useTableStore();

  useEffect(() => {
    const interval = setInterval(() => {
      const unPurchasedOrder = clientTable?.tableContexts.flatMap((tableContext) =>
        tableContext.orders.filter((order) => !order.payment.paid)
      )[0];

      if (!unPurchasedOrder) {
        handleClose();
        return;
      }

      setPurchasePrice(unPurchasedOrder!.payment!.amount - clientTable!.key);
      const orderTimestamp = unPurchasedOrder!.payment!.createdAt;
      const nowTimestamp = Date.now();
      const limitTimestamp = orderTimestamp + 5 * 60 * 1000;
      const remainingTime = Math.floor((limitTimestamp - nowTimestamp) / 1000);
      setRemainingTime(remainingTime);
      console.log(remainingTime);

      if (remainingTime <= 0) {
        toast({
          title: "주문이 자동취소되었습니다.",
          description: "입금 시간이 초과되었습니다.",
          variant: "destructive",
        });
        clientGetTable({ tableId: clientTable!.id });
        handleClose();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [clientTable]);

  const handleConfirm = async () => {
    handleClose();
  }

  const handleClose = () => {
    setOpenState(false);
  }

  return (
    <Dialog open={openState} onOpenChange={handleClose}>
      <DialogContent className="w-[96%] border-blue-500 border-2 rounded-xl">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription className="fc text-md items-center">
            <span className="text-blue-500 text-2xl font-extrabold text-center z-10 bg-white px-2">꼭! 지켜주세요</span>
            <span className="fc rounded-lg border-2 border-gray-300 p-4 pt-6 -mt-4 *:text-sm *:text-left *:text-gray-800">
              <span>
                <b>1</b>. 금액이 더 적게 청구되는 현상은 정상입니다. <b className="dangerTXT">금액을 절대 변경하지 마세요</b>.
              </span>
              <span>
                <b>2</b>. 입금 전까지 다른 주문이 불가하며, <b className="dangerTXT">주문 이후 5분 동안 입금되지 않을 경우 주문이 자동취소</b>됩니다.
              </span>
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="w-full fc items-center">
          <div className="w-[200px] h-[200px] rounded-lg p-2 border-4 border-blue-500 m-2">
            <QRCodeSVG className="full" value={clientTable!.id.repeat(10)} />
          </div>
          <div className="fr w-[280px] oveflow-hidden rounded-lg bg-gray-200 py-2 px-4 justify-center mb-2">
            <span className="truncate max-w-[200px] text-gray-600 font-light">https://toss.im/{clientTable!.id.repeat(10)}</span>
            <LinkIcon className="text-gray-600 scale-75" />
          </div>
          <div className="fc w-full mt-4 justify-between">
            <div className="fr items-center justify-between">
              <span className="h-full leading-8 font-bold w-fit mr-2">⋅ 입금 계좌</span>
              <div className="fr oveflow-hidden rounded-lg bg-gray-200 py-1 px-2 justify-end mb-2 items-center">
                <span className="truncate text-gray-600 text-sm">국민은행 111102-04-273566</span>
                <ClipboardPasteIcon className="text-gray-600 scale-75 w-fit" />
              </div>
            </div>
            <div className="fr items-center justify-between">
              <span className="font-bold">⋅ 입금 금액</span>
              <span className="text-blue-500 text-xl font-bold">{purchasePrice.toLocaleString()}원</span>
            </div>
            <div className="fr items-center justify-between">
              <span className="font-bold">⋅ 남은 시간</span>
              <span className="text-blue-500 text-xl font-bold">{dateDiffString(remainingTime * 1000, 0)}</span>
            </div>
          </div>
        </div>
        <DialogFooter className="fr *:flex-1 *:mx-2 *:h-14 *:rounded-2xl *:text-lg">
          {/* <Button variant="outline" onClick={handleClose}>취소</Button> */}
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleConfirm}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  );
}