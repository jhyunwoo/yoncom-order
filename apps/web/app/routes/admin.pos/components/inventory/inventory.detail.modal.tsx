import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import useTableStore from "~/stores/table.store";
import * as MenuResponse from "shared/api/types/responses/menu";
import { Menu } from "db/schema";
import useMenuStore from "~/stores/menu.store";

export default function InventoryDetailModal({
  openState, setOpenState,
  menu,
}: {
  openState: boolean;
  setOpenState: any;
  menu: Menu;
}) {
  const { menuCategories } = useMenuStore();
  const menuCategoryName = menuCategories.find((category) => category.id === menu.menuCategoryId)?.name;

  const [menuName, setMenuName] = useState(menu.name || "");
  const [menuCategory, setMenuCategory] = useState(menu.menuCategoryId || "");
  const [menuDescription, setMenuDescription] = useState(menu.description || "");
  const [menuImage, setMenuImage] = useState(menu.image || "");
  const [menuPrice, setMenuPrice] = useState(menu.price?.toString() || "");
  const [menuStock, setMenuStock] = useState(menu.quantity?.toString() || "");

  const handleConfirm = async () => {
    handleClose();
  }

  const handleClose = () => {
    setOpenState(false);
  }

  useEffect(() => {
    setMenuName(menu.name || "");
    setMenuCategory(menu.menuCategoryId || "");
    setMenuDescription(menu.description || "");
    setMenuImage(menu.image || "");
    setMenuPrice(menu.price?.toString() || "");
  }, [menu]);

  return (
    <Dialog open={openState} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`메뉴 상세 정보 - ${menu.name}`}</DialogTitle>
          <DialogDescription>메뉴와 재고 사항을 확인 및 설정합니다.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4">
          {/* 메뉴 이름 */}
          <div className="space-y-2 col-span-2 fc">
            <label className="text-sm font-medium -mb-1">이름</label>
            <Input
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              placeholder="메뉴 이름을 입력하세요"
            />
          </div>

          {/* 메뉴 이미지 */}
          <div className="space-y-2 row-span-4 fc">
            <label className="text-sm font-medium -mb-1">이미지 URL</label>
            <Input
              value={menuImage}
              onChange={(e) => setMenuImage(e.target.value)}
              placeholder="이미지 URL을 입력하세요"
            />
          </div>

          {/* 메뉴 카테고리 */}
          <div className="space-y-2 col-span-2 fc">
            <label className="text-sm font-medium -mb-1">카테고리</label>
            <Select value={menuCategory} onValueChange={setMenuCategory}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {menuCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 메뉴 설명 */}
          <div className="space-y-2 col-span-2 fc">
            <label className="text-sm font-medium -mb-1">설명</label>
            <Input
              value={menuDescription}
              onChange={(e) => setMenuDescription(e.target.value)}
              placeholder="메뉴 설명을 입력하세요"
            />
          </div>

          {/* 메뉴 가격 */}
          <div className="space-y-2 fc">
            <label className="text-sm font-medium -mb-1">가격 (원)</label>
            <Input
              type="number"
              value={menuPrice}
              onChange={(e) => setMenuPrice(e.target.value)}
              placeholder="가격을 입력하세요"
            />
          </div>

          {/* 메뉴 재고 */}
          <div className="space-y-2 fc">
            <label className="text-sm font-medium -mb-1">재고 수량</label>
            <Input
              type="number"
              value={menuStock}
              onChange={(e) => setMenuStock(e.target.value)}
              placeholder="재고 수량을 입력하세요"
            />
          </div>
        </div>

        {/* <DialogDescription className={`-mt-2 text-right`}>⚠︎ 올바른 이름과 좌석 수를 입력하세요.</DialogDescription> */}
        <DialogFooter className="">
          <Button onClick={handleConfirm} className="dangerBG dangerB">저장</Button>
          <Button onClick={handleClose}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

}