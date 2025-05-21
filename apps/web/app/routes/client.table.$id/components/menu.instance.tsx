import { Card } from "~/components/ui/card";
import * as MenuResponse from "shared/api/types/responses/menu";
import { useState } from "react";
import OrderAddModal from "./order.add.modal";

export default function MenuInstance({ menu }: { menu: MenuResponse.ClientGet["result"][number]["menus"][number] }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {menu.quantity <= 0
        ? ( // 품절
          <Card className="fc mb-3 p-4 bg-gray-50 [&_*]:text-gray-300">
            <div className="fr justify-between items-center bg-none h-full">
              <div className="fr">
                <img src={"/" + "favicon.ico"} alt="" width={50} height={50} className="rounded-md" />
                <div className="fc ml-4">
                  <h1 className="font-bold text-xl flex items-center">{menu.name}</h1>
                  <span className="text-sm">{menu.description}</span>
                </div>
              </div>
              <span className="text-md">{menu.price.toLocaleString()}원</span>
            </div>
          </Card>
        ) : (
          <Card
            className="fc mb-3 p-4 hover:cursor-pointer hover:bg-gray-100"
            onClick={() => setModalOpen(true)}
          >
            <div className="fr justify-between items-center bg-none h-full">
              <div className="fr">
                <img src={"/" + "favicon.ico"} alt="" width={50} height={50} className="rounded-md" />
                <div className="fc ml-4">
                  <h1 className="font-bold text-xl flex items-center">{menu.name}</h1>
                  <span className="text-sm">{menu.description}</span>
                </div>
              </div>
              <span className="text-md">{menu.price.toLocaleString()}원</span>
            </div>
          </Card>
        )}
      <OrderAddModal
        menu={menu}
        openState={modalOpen}
        setOpenState={setModalOpen}
      />
    </>
  );
}