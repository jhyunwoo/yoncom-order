import useMenuStore from "~/stores/menu.store";
import useTableStore from "~/stores/table.store";
import { toast } from "./use-toast";
import useCartStore, { CartState } from "~/stores/cart.store";

export function useValidateOrder() {
  const { clientTable } = useTableStore();
  const { clientLoad } = useMenuStore();

  return async function validateOrder(menuOrders: CartState["menuOrders"]) {
    const success = await clientLoad({ userId: clientTable?.userId ?? "" });

    if (!success) {
      toast({
        title: "메뉴 정보를 불러오는데 실패했습니다.",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
      return false;
    }

    const updatedMenus = success.result.flatMap((m) => m.menus);

    for (const menuOrder of menuOrders) {
      const updatedMenu = updatedMenus.find((m) => m.id === menuOrder.menuId);
      if (!updatedMenu) {
        toast({
          title: "메뉴가 삭제되었습니다.",
          description: "다른 메뉴를 주문해주세요.",
          variant: "destructive",
        });
        useCartStore.getState().removeMenuOrder(menuOrder.menuId);
        return false;
      }
      if (menuOrder.quantity > updatedMenu.quantity) {
        toast({
          title: "메뉴 수량이 변경되었습니다.",
          description: "다시 시도해주세요.",
          variant: "default",
        });
        return false;
      }
      if (!updatedMenu.available || updatedMenu.quantity <= 0) {
        toast({
          title: "메뉴가 품절 또는 비활성화 되었습니다.",
          description: "다른 메뉴를 주문해주세요.",
          variant: "destructive",
        });
        useCartStore.getState().removeMenuOrder(menuOrder.menuId);
        return false;
      }
    }

    return true;
  };
}
