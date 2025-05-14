
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import useCartStore from "~/stores/cart.store";
import * as MenuResponse from "shared/api/types/responses/menu";
import { MinusIcon, Plus, PlusIcon } from "lucide-react";

export default function MenuCartModal({
  menu,
  openState, setOpenState,
  modalClassName,
}: {
  menu: MenuResponse.ClientGet["result"][number]["menus"][number];
  openState: boolean;
  setOpenState: any;
  modalClassName?: string;
}) {
  const [quantity, setQuantity] = useState<number>(1);
  const [invalid, setInvalid] = useState(false);

  const { addMenuOrder } = useCartStore();

  const handleConfirm = async () => {
    if (quantity <= 0) {
      setInvalid(true);
      return;
    }

    addMenuOrder({ menuId: menu.id, quantity });
    handleClose();
  }

  const handleClose = () => {
    setQuantity(1);
    setInvalid(false);
    setOpenState(false);
  }

  return (
    <Dialog open={openState} onOpenChange={handleClose}>
      <DialogContent className={modalClassName}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{menu.name}</DialogTitle>
          <DialogDescription className="text-md">{menu.description}</DialogDescription>
        </DialogHeader>
        <div className="fr justify-center items-center">
          <Button 
            onClick={() => setQuantity(quantity - 1)}
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white"
          ><MinusIcon className="scale-150"/></Button>
          <Input
            type="number"
            min={1}
            max={menu.quantity}
            placeholder="수량을 선택하세요"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="text-center w-16 text-xl font-bold h-16 mx-4"
          />
          <Button 
            onClick={() => setQuantity(quantity + 1)}
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white"
          ><PlusIcon className="scale-150"/></Button>
        </div>
        <DialogDescription className={`-mt-2 text-right ${invalid ? "dangerTXT" : "hidden"}`}>⚠︎ 올바른 수량을 입력하세요.</DialogDescription>
        <DialogFooter className="fr *:flex-1 *:mx-2 *:h-14 *:rounded-2xl">
          <Button variant="outline" onClick={handleClose}>취소</Button>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleConfirm}>장바구니 담기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  );

}