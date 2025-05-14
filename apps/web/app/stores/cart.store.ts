import { create } from "zustand";
import * as OrderRequest from "shared/api/types/requests/order";
import * as OrderResponse from "shared/api/types/responses/order";
import queryStore from "~/lib/query";
import useTableStore from "./table.store";
import { toast } from "~/hooks/use-toast";

type MenuOrderQuery = OrderRequest.CreateQuery["menuOrders"][number]

type CartState = {
  menuOrders: MenuOrderQuery[];

  addMenuOrder: (menuOrder: MenuOrderQuery) => void;
  removeMenuOrder: (menuOrderId: string) => void;
  updateMenuOrder: (menuOrderId: string, menuOrder: MenuOrderQuery) => void;

  purchaseMenuOrders: () => Promise<void>;
  clearMenuOrders: () => void;
}

const useCartStore = create<CartState>((set, get) => ({
  menuOrders: [],

  addMenuOrder: (menuOrder: MenuOrderQuery) => {
    const recentOrder = get().menuOrders.find((order) => order.menuId === menuOrder.menuId);
    if (recentOrder) {
      get().updateMenuOrder(recentOrder.menuId, {
        ...recentOrder,
        quantity: recentOrder.quantity + menuOrder.quantity,
      });
    } else {
      set((state) => ({
        menuOrders: [...state.menuOrders, menuOrder],
      }))
    }
  },

  removeMenuOrder: (menuOrderId: string) => {
    set((state) => ({
      menuOrders: state.menuOrders.filter((menuOrder) => menuOrder.menuId !== menuOrderId),
    }))
  },

  updateMenuOrder: (menuOrderId: string, menuOrder: MenuOrderQuery) => {
    set((state) => ({
      menuOrders: state.menuOrders.map((order) => order.menuId === menuOrderId ? menuOrder : order),
    }))
  },

  purchaseMenuOrders: async () => {
    const table = useTableStore.getState().clientTable;
    if (!table || get().menuOrders.length === 0) {
      toast({
        title: "올바르지 않은 주문 요청입니다.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    await queryStore<OrderRequest.CreateQuery, OrderResponse.Create>({
      route: "/api/order",
      method: "post",
      query: {
        tableId: table.id,
        menuOrders: get().menuOrders,
      },
    })
  },

  clearMenuOrders: () => {
    set((state) => ({
      menuOrders: [],
    }))
  },
}))

export default useCartStore;