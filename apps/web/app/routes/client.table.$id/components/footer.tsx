import { useState } from "react";
import { Button } from "~/components/ui/button"
import OrderModal from "./order.modal";
import useCartStore from "~/stores/cart.store";
import useTableStore from "~/stores/table.store";
import PurchaseModal from "./purchase.modal";

export default function Footer() {
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const { menuOrders } = useCartStore();
  const { clientTable } = useTableStore();

  return (
    <>
      <div className="w-full h-20 fr p-1 mb-3">
        <div className="w-fit h-full mr-2">
          <Button variant="outline" className="w-full h-full text-center text-lg bg-gray-100 hover:bg-gray-200 rounded-3xl">
            <span className="leading-6 text-gray-500">이전<br />주문내역</span>
          </Button>
        </div>
        {clientTable?.tableContexts.some((tableContext) => tableContext.orders.some((order) => !order.payment.paid))
          ? (
            <Button
              onClick={() => setPurchaseModalOpen(true)}
              className="fc flex-1 h-full rounded-3xl bg-gray-500 hover:bg-gray-500 text-white text-2xl hover:cursor-default"
            >결제하기<br /><span className="-mt-2 text-sm text-gray-300">결제 대기중인 항목이 있습니다.</span>
            </Button>
          ) : (
            <Button
              onClick={() => setOrderModalOpen(true)}
              className="flex-1 h-full rounded-3xl bg-blue-500 text-white text-2xl hover:bg-blue-600"
            >주문하기
              {menuOrders.length > 0 && (
                <span className="block -mr-4 w-7 h-7 text-lg text-center text-blue-600 bg-white rounded-full">{menuOrders.length}</span>
              )}
            </Button>
          )
        }
        <PurchaseModal
          openState={purchaseModalOpen}
          setOpenState={setPurchaseModalOpen}
        />
        <OrderModal
          openState={orderModalOpen}
          setOpenState={setOrderModalOpen}
        />
      </div>
    </>
  )
}