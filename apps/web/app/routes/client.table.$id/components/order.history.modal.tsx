
import { Button } from "~/components/ui/button";
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { DialogContent } from "~/components/ui/dialog";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import OrderUpdateModal from "./order.update.modal";
import OrderConfirmModal from "./order.confirm.modal";
import useTableStore from "~/stores/table.store";

export default function OrderHistoryModal({
  openState, setOpenState,
}: {
  openState: boolean;
  setOpenState: (open: boolean) => void;
}) {
  const { clientTable } = useTableStore();
  const tableContext = clientTable!.tableContexts[0];
  const orders = tableContext!.orders;

  const handleConfirm = () => {
    setOpenState(false);
  }
  const handleClose = () => {
    setOpenState(false);
  }

  return (
    <>
      <Dialog open={openState} onOpenChange={setOpenState}>
        <DialogContent className="fc w-[96%] min-h-[25rem] max-h-[40rem] justify-between border-blue-500 border-2 rounded-xl">
          {orders.length === 0 ? (
            <DialogHeader >
              <DialogTitle>주문 내역</DialogTitle>
              <DialogDescription>주문 내역이 없습니다.</DialogDescription>
            </DialogHeader>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">주문 내역</DialogTitle>
                <DialogDescription className="text-md text-center">주문 내역을 확인하세요.</DialogDescription>
              </DialogHeader>
              <Table>
                <TableHeader className="bg-gray-200">
                  <TableRow>
                    {/* <TableHead></TableHead> */}
                    <TableHead className="!text-left font-bold">주문 일시</TableHead>
                    <TableHead className="!text-right">상태</TableHead>
                    <TableHead className="!text-right">금액</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, index) => (
                    <TableRow
                      key={order.id}
                      onClick={() => {}}
                      className="h-14 *:text-base"
                    >
                      {/* <TableCell className="text-center">{index + 1}</TableCell> */}
                      <TableCell className="text-left font-bold">{order.createdAt}</TableCell>
                      <TableCell className="text-right">{order.}</TableCell>
                      <TableCell className="text-right">{menuOrderInfo!.quantity}</TableCell>
                      <TableCell className="text-right">{menuOrderInfo!.totalPrice.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="text-right">
                <span className="text-right text-lg mr-2">총액</span>
                <span className="text-right text-2xl font-bold">
                  {menuOrderInfos.reduce((acc, menuOrderInfo) => acc + menuOrderInfo!.totalPrice, 0).toLocaleString()} 원
                </span>
              </div>
              <DialogFooter className="h-fit fr *:flex-1 *:mx-2 *:h-14 *:rounded-2xl *:text-lg">
                <Button variant="outline" onClick={handleClose}>취소</Button>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleConfirm}>주문하기</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      {modalMenuOrder && (
        <OrderUpdateModal
          menuOrder={modalMenuOrder}
          openState={modalOpenState}
          setOpenState={setModalOpenState}
        />
      )}
      <OrderConfirmModal
        openState={confirmModalOpenState}
        setOpenState={setConfirmModalOpenState}
      />
    </>
  )
}