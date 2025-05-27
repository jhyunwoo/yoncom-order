
import { useState } from "react";
import { Button } from "~/components/ui/button";
import useMenuStore from "~/stores/menu.store";
import useTableStore from "~/stores/table.store";
import MenuRemoveModal from "./components/menu.remove.modal";
import MenuAddModal from "./components/menu.add.modal";
import MenuMonitor from "./components/menu.monitor";

export default function Cooker() {
  const { tables } = useTableStore();
  const { menus } = useMenuStore();

  const [menuAddModalOpen, setMenuAddModalOpen] = useState(false);
  const [menuRemoveModalOpen, setMenuRemoveModalOpen] = useState(false);

  const [monitoringMenus, setMonitoringMenus] = useState<string[]>([]);

  const handleAddMenu = () => {
    setMonitoringMenus([...monitoringMenus, menus[0].id]);
  }

  const handleRemoveMenu = () => {
    setMonitoringMenus(monitoringMenus.filter((menu) => menu !== menus[0].id));
  }

  return (
    <div className="w-screen h-screen fc bg-white p-2">
      <h1 className="font-bold text-2xl mx-4 my-4">메뉴 모니터링</h1>
      <div className="w-full h-fit fr *:mx-1 justify-end">
        <Button onClick={() => setMenuAddModalOpen(true)}>메뉴 추가</Button>
        <Button variant="outline" onClick={() => setMenuRemoveModalOpen(true)}>메뉴 제거</Button>
      </div>
      <div className="w-full flex-1 fr p-2">
        {monitoringMenus.map((menuId) => (
          <MenuMonitor key={menuId} menuId={menuId} />
        ))}
      </div>
      <MenuAddModal
        openState={menuAddModalOpen}
        setOpenState={setMenuAddModalOpen}
        monitoringMenus={monitoringMenus}
        setMonitoringMenus={setMonitoringMenus}
      />
      <MenuRemoveModal
        openState={menuRemoveModalOpen}
        setOpenState={setMenuRemoveModalOpen}
        monitoringMenus={monitoringMenus}
        setMonitoringMenus={setMonitoringMenus}
      />
    </div>
  );
}