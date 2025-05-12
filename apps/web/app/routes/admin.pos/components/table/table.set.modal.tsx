import { useState } from "react";
import ky, { HTTPError } from "ky";
import { Button } from "~/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import * as Schema from "db/schema";
import useTableStore from "~/stores/table.store";
import { toast } from "~/hooks/use-toast";
import * as TableResponse from "shared/api/types/responses/table";

export default function TableSetModal({
  table,
  openState, setOpenState,
  modalClassName,
}: {
  table: TableResponse.AdminGet["result"][0];
  openState: boolean;
  setOpenState: (openState: boolean) => void;
  modalClassName?: string;
}) {
  const activeTableContext = table.tableContexts.find((tableContext) => tableContext.deletedAt === null);
  const inUse = activeTableContext !== undefined;
  const prompt = inUse ? "미사용" : "사용 중";
  const { occupyTable, vacateTable, loading } = useTableStore();
  const confirmFunction = inUse ? vacateTable : occupyTable;

  const handleConfirm = async () => {
    if (loading) return;
    await confirmFunction({ tableId: table.id });
    handleCancel();
  }

  const handleCancel = () => {
    setOpenState(false);
  }

  return (
    <Dialog open={openState} onOpenChange={handleCancel}>
      <DialogContent className={modalClassName}>
        <DialogHeader>
          <DialogTitle>테이블 상태 변경</DialogTitle>
          <DialogDescription className="text-neutral-800"><b>{table.name}</b>을(를) {prompt} 중으로 변경하시겠습니까?</DialogDescription>
        </DialogHeader>
        <p className="dangerTXT text-sm" style={{
          opacity: inUse ? 1 : 0,
        }}>
          ⚠︎ 테이블이 미사용 상태로 변경되면, 해당 테이블의 주문 내역이 모두 초기화되고 진행 중인 주문은 모두 취소됩니다.
        </p>
        <DialogFooter>
          <Button onClick={handleCancel} variant="outline">취소</Button>
          <Button onClick={handleConfirm}>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

}