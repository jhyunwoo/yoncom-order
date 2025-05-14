import { useState } from "react";
import { Button } from "~/components/ui/button"
import OrderModal from "./order.modal";

export default function Footer({ onClick }: { onClick: () => void }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setModalOpen(true)}
        className="w-full h-fit mb-2 bg-blue-500 text-white font-semibold text-2xl hover:bg-blue-600"
      >주문하기</Button>
      <OrderModal 
        openState={modalOpen}
        setOpenState={setModalOpen}
      />
    </>
  )
}