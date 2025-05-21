import { useState } from "react";
import { Button } from "~/components/ui/button"
import OrderModal from "./order.modal";
import useCartStore from "~/stores/cart.store";
import { ListIcon } from "lucide-react";
export default function Footer({ onClick }: { onClick: () => void }) {
  const [modalOpen, setModalOpen] = useState(false);
  const { menuOrders } = useCartStore();

  return (
    <>
      <div className="w-full h-20 fr p-1 mb-3">
        <div className="w-fit h-full mr-2">
          <Button variant="outline" className="w-full h-full text-center text-lg bg-gray-100 hover:bg-gray-200 rounded-3xl">
            <span className="leading-6 text-gray-500">이전<br/>주문내역</span>
          </Button>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="flex-1 h-full rounded-3xl bg-blue-500 text-white text-2xl hover:bg-blue-600"
        >주문하기
          {menuOrders.length > 0 && (
            <span className="block -mr-4 w-7 h-7 text-lg text-center text-blue-600 bg-white rounded-full">{menuOrders.length}</span>
          )}
        </Button>
        <OrderModal
          openState={modalOpen}
          setOpenState={setModalOpen}
        />
      </div>
    </>
  )
}