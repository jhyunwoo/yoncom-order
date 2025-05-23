import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import * as MenuResponse from "shared/api/types/responses/menu";
import MenuInstance from "./menu.instance";

export default function Menus({ menuCategories }: { menuCategories: MenuResponse.ClientGet["result"] }) {
  return (
    <Tabs
      className="w-full flex-1 fc overflow-hidden pb-2"
      defaultValue={menuCategories[0]?.id} 
    >
      <TabsList className="w-full h-fit justify-normal bg-blue-50">
        {menuCategories.map((menuCategory) => 
          <TabsTrigger 
            key={menuCategory.id} 
            value={menuCategory.id}
            className="text-lg font-semibold hover:bg-blue-100 hover:text-blue-600 m-1"
          >{menuCategory.name}</TabsTrigger>
        )}
      </TabsList>
      {menuCategories.map((menuCategory) => (
        <TabsContent className="flex-1 overflow-y-scroll" key={menuCategory.id} value={menuCategory.id}>
          {menuCategory.menus.map((menu) =>
            <MenuInstance key={menu.id} menu={menu} />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}