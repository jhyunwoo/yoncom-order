
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import useCartStore, { CartState } from "~/stores/cart.store";
import * as MenuResponse from "types/responses/client/menu";
import { MinusIcon, Plus, PlusIcon } from "lucide-react";
import useMenuStore from "~/stores/menu.store";

export default function OrderUpdateModal({
  menuOrder,
  openState, setOpenState,
}: {
  menuOrder: CartState["menuOrders"][number];
  openState: boolean;
  setOpenState: any;
}) {
  const [quantity, setQuantity] = useState<number>(0);
  const [invalid, setInvalid] = useState(false);

  const { updateMenuOrder } = useCartStore();
  const { clientMenuCategories } = useMenuStore();

  useEffect(() => {
    setQuantity(menuOrder.quantity);
  }, [menuOrder]);

  const menu = clientMenuCategories!
    .flatMap((menuCategory) => menuCategory.menus)
    .find((menu) => menu.id === menuOrder.menuId)!;

  const handleConfirm = async () => {
    if (quantity < 0 || quantity > menu.quantity) {
      setInvalid(true);
      return;
    }

    updateMenuOrder(menuOrder.menuId, { menuId: menuOrder.menuId, quantity });
    handleClose();
  }

  const handleClose = () => {
    setInvalid(false);
    setOpenState(false);
  }

  return (
    <Dialog open={openState} onOpenChange={handleClose}>
      <DialogContent className="fc justify-between w-[96%] h-[20rem] border-blue-500 border-2 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{menu.name}</DialogTitle>
          <DialogDescription className="text-md">메뉴 수량을 조정할까요?</DialogDescription>
        </DialogHeader>
        <div className="fr justify-center items-center">
          <Button 
            onClick={() => quantity > 0 && setQuantity(quantity - 1)}
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white"
          ><MinusIcon className="scale-150"/></Button>
          <Input
            type="number"
            min={0}
            max={menu.quantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="text-center w-16 !text-2xl font-bold h-16 mx-4 input-no-spinner"
          />
          <Button 
            onClick={() => quantity < menu.quantity && setQuantity(quantity + 1)}
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white"
          ><PlusIcon className="scale-150"/></Button>
        </div>
        <span className="text-sm text-center">주문 가능 수량: {menu.quantity}</span>
        <DialogDescription className={`-mt-2 text-right ${invalid ? "dangerTXT" : "hidden"}`}>⚠︎ 올바른 수량을 입력하세요.</DialogDescription>
        <DialogFooter className="fr *:flex-1 *:mx-2 *:h-14 *:rounded-2xl *:text-lg">
          <Button variant="outline" onClick={handleClose}>취소</Button>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleConfirm}>수정하기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  );
}