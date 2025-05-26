import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import useTableStore from "~/stores/table.store";
import * as Schema from "db/schema";
import * as TableResponse from "shared/api/types/responses/table";
import useMenuStore from "~/stores/menu.store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import InventoryDetailModal from "./inventory.detail.modal";
import { Menu } from "db/schema";
import { Button } from "~/components/ui/button";
import InventoryCreateModal from "./inventory.create.modal";
import InventoryRemoveModal from "./inventory.remove.modal";

export default function Inventories() {
  const [menuDetail, setMenuDetail] = useState<Menu | null>(null);
  const [menuDetailModalOpenState, setMenuDetailModalOpenState] = useState(false);
  const { menus } = useMenuStore();

  const [createMenuModalOpen, setCreateMenuModalOpen] = useState(false);
  const [removeMenuModalOpen, setRemoveMenuModalOpen] = useState(false);

  return (
    <div className="full p-2">
      <Card className="full bg-[#F2F2F2] px-3 fc rounded-3xl">
        <CardHeader className="px-2">
          <CardTitle className="text-2xl">재고 현황</CardTitle>
        </CardHeader>
        <div className="fr justify-end *:mx-1 mb-3">
          <Button onClick={() => setCreateMenuModalOpen(true)}>메뉴 추가</Button>
          <Button variant="outline" onClick={() => setRemoveMenuModalOpen(true)}>메뉴 제거</Button>
        </div>
        <CardContent className="p-0 overflow-scroll">
          <Table className="rounded-xl overflow-hidden">
            <TableHeader>
              <TableRow className="bg-gray-500 *:text-white">
                <TableHead className="text-start">메뉴</TableHead>
                <TableHead className="text-center">재고</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menus
                .filter((menu) => !menu.deletedAt)
                .map((menu) => (
                <TableRow
                  key={menu.id}
                  className="bg-white hover:bg-gray-100 hover:cursor-pointer"
                  onClick={() => {
                    setMenuDetail(menu);
                    setMenuDetailModalOpenState(true);
                  }}
                >
                  <TableCell className="text-start">{menu.name}</TableCell>
                  <TableCell className="text-center">{menu.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {menuDetail && (
        <InventoryDetailModal
          menu={menuDetail}
          openState={menuDetailModalOpenState}
          setOpenState={setMenuDetailModalOpenState}
        />
      )}
      <InventoryCreateModal
        openState={createMenuModalOpen}
        setOpenState={setCreateMenuModalOpen}
      />
      <InventoryRemoveModal
        openState={removeMenuModalOpen}
        setOpenState={setRemoveMenuModalOpen}
      />
    </div>
  );
}