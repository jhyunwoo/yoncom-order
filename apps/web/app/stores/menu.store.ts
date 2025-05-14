import { create } from 'zustand';
import * as Schema from 'db/schema';
import * as MenuRequest from 'shared/api/types/requests/menu';
import * as MenuResponse from 'shared/api/types/responses/menu';
import * as MenuCategoryRequest from 'shared/api/types/requests/menuCategory';
import * as MenuCategoryResponse from 'shared/api/types/responses/menuCategory';
import queryStore from '~/lib/query';
import { toast } from '~/hooks/use-toast';

export type MenuState = {
  clientMenuCategories: MenuResponse.ClientGet["result"] | null;
  menuCategories: Schema.MenuCategory[];
  menus: Schema.Menu[];
  isLoaded: boolean;
  error: boolean;

  clientLoad: (query: MenuRequest.ClientGetQuery) => Promise<MenuResponse.ClientGet | null>;
  adminLoad: (query: MenuRequest.AdminGetQuery) => Promise<MenuResponse.AdminGet | null>;

  createMenu: (query: MenuRequest.CreateQuery) => Promise<MenuResponse.Create | null>;
  removeMenu: (query: MenuRequest.RemoveQuery) => Promise<MenuResponse.Remove | null>;
  updateMenu: (query: MenuRequest.UpdateQuery) => Promise<MenuResponse.Update | null>;

  createMenuCategory: (query: MenuCategoryRequest.CreateQuery) => Promise<MenuCategoryResponse.Create | null>;
  removeMenuCategory: (query: MenuCategoryRequest.RemoveQuery) => Promise<MenuCategoryResponse.Remove | null>;
  updateMenuCategory: (query: MenuCategoryRequest.UpdateQuery) => Promise<MenuCategoryResponse.Update | null>;

  // 다른 store에서 사용하기 위해 노출. component에서 사용하지 않음.
  _setMenus: (menus: Schema.Menu[]) => void;
}

const useMenuStore = create<MenuState>((set, get) => ({
  clientMenuCategories: null,
  menuCategories: [],
  menus: [],
  isLoaded: false,
  error: false,

  clientLoad: async (query: MenuRequest.ClientGetQuery) => queryStore<MenuRequest.ClientGetQuery, MenuResponse.ClientGet>({
    route: "menu",
    method: "get",
    query,
    setter: set,
    onSuccess: (res) => set({
      clientMenuCategories: res.result,
    }),
  }),

  adminLoad: async (query: MenuRequest.AdminGetQuery) => queryStore<MenuRequest.AdminGetQuery, MenuResponse.AdminGet>({
    route: "admin/menu",
    method: "get",
    query,
    setter: set,
    onSuccess: (res) => set({
      menuCategories: res.result.map((menuCategory) => ({ ...menuCategory, menus: undefined })),
      menus: res.result.flatMap((menuCategory) => menuCategory.menus)
    })
  }),

  createMenu: async (query: MenuRequest.CreateQuery) => queryStore<MenuRequest.CreateQuery, MenuResponse.Create>({
    route: "menu",
    method: "post",
    query,
    setter: set,
    onSuccess: (res) => toast({
      title: "메뉴 생성 완료",
      description: "메뉴가 성공적으로 생성되었습니다.",
      duration: 3000,
    }),
  }),

  removeMenu: async (query: MenuRequest.RemoveQuery) => queryStore<MenuRequest.RemoveQuery, MenuResponse.Remove>({
    route: "menu",
    method: "delete",
    query,
    setter: set,
    onSuccess: (res) => toast({
      title: "메뉴 삭제 완료",
      description: "메뉴가 성공적으로 삭제되었습니다.",
      duration: 3000,
    }),
  }),

  updateMenu: async (query: MenuRequest.UpdateQuery) => queryStore<MenuRequest.UpdateQuery, MenuResponse.Update>({
    route: "menu",
    method: "put",
    query,
    setter: set,
    onSuccess: (res) => toast({
      title: "메뉴 수정 완료",
      description: "메뉴가 성공적으로 수정되었습니다.",
      duration: 3000,
    }),
  }),

  createMenuCategory: async (query: MenuCategoryRequest.CreateQuery) => queryStore<MenuCategoryRequest.CreateQuery, MenuCategoryResponse.Create>({
    route: "menuCategory",
    method: "post",
    query,
    setter: set,
    onSuccess: (res) => toast({
      title: "메뉴 카테고리 생성 완료",
      description: "메뉴 카테고리가 성공적으로 생성되었습니다.",
      duration: 3000,
    }),
  }),

  removeMenuCategory: async (query: MenuCategoryRequest.RemoveQuery) => queryStore<MenuCategoryRequest.RemoveQuery, MenuCategoryResponse.Remove>({
    route: "menuCategory",
    method: "delete",
    query,
    setter: set,
    onSuccess: (res) => toast({
      title: "메뉴 카테고리 삭제 완료",
      description: "메뉴 카테고리가 성공적으로 삭제되었습니다.",
      duration: 3000,
    }),
  }),

  updateMenuCategory: async (query: MenuCategoryRequest.UpdateQuery) => queryStore<MenuCategoryRequest.UpdateQuery, MenuCategoryResponse.Update>({
    route: "menuCategory",
    method: "put",
    query,
    setter: set,
    onSuccess: (res) => toast({
      title: "메뉴 카테고리 수정 완료",
      description: "메뉴 카테고리가 성공적으로 수정되었습니다.",
      duration: 3000,
    }),
  }),

  _setMenus: (menus: Schema.Menu[]) => set({ menus }),
}));

export default useMenuStore;