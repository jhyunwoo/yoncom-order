import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import useTableStore from "~/stores/table.store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

export default function CreateTableModal({
  openState, setOpenState,
  modalClassName,
}: {
  openState: boolean;
  setOpenState: any;
  modalClassName?: string;
}) {
  const [tableId, setTableId] = useState<string>("");
  const [tableName, setTableName] = useState<string>("");
  const [tableSeats, setTableSeats] = useState<number>(0);
  const [invalid, setInvalid] = useState(false);

  const { tables, updateTable } = useTableStore();

  const handleConfirm = async () => {
    if (
      tableId.length === 0
      || tableName.length === 0
      || tableSeats <= 0
    ) {
      setInvalid(true);
      return;
    }

    await updateTable({ tableId, tableOptions: { name: tableName, seats: tableSeats } });
    handleClose();
  }

  const handleClose = () => {
    setTableId("");
    setTableName("");
    setTableSeats(0);
    setInvalid(false);
    setOpenState(false);
  }

  return (
    <Dialog open={openState} onOpenChange={handleClose}>
      <DialogContent className={modalClassName}>
        <DialogHeader>
          <DialogTitle>테이블 변경</DialogTitle>
          <DialogDescription>변경할 테이블을 선택하세요.</DialogDescription>
        </DialogHeader>
        <Select value={tableId} onValueChange={(value) => {
          setTableId(value);
          setTableName(tables.find((table) => table.id === value)?.name || "");
          setTableSeats(tables.find((table) => table.id === value)?.seats || 0);
        }}>
          <SelectTrigger>
            <SelectValue placeholder="변경할 테이블을 선택하세요"></SelectValue>
          </SelectTrigger>
          <SelectContent>
            {tables.map((table) =>
              <SelectItem key={table.id} value={table.id}>{table.name}</SelectItem>
            )}
          </SelectContent>
        </Select>
        <Input
          type="text"
          placeholder="테이블 이름을 입력하세요"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
        />
        <Input
          type="number"
          placeholder="테이블 좌석 수를 입력하세요"
          value={tableSeats}
          onChange={(e) => setTableSeats(Number(e.target.value))}
        />
        <DialogDescription className={`-mt-2 text-right ${invalid ? "dangerTXT" : "hidden"}`}>⚠︎ 올바른 이름과 좌석 수를 입력하세요.</DialogDescription>
        <DialogFooter className="">
          <Button variant="outline" onClick={handleClose}>취소</Button>
          <Button onClick={handleConfirm}>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

}