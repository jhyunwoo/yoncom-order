import { create } from 'zustand';
import * as Schema from 'db/schema';
import * as MenuRequest from 'shared/api/types/requests/menu';
import * as MenuResponse from 'shared/api/types/responses/menu';
import * as MenuCategoryRequest from 'shared/api/types/requests/menuCategory';
import * as MenuCategoryResponse from 'shared/api/types/responses/menuCategory';
import queryStore from 'web/app/lib/query';

type MenuState = {
    menuCategories: Schema.MenuCategory[];
    menus: Schema.Menu[];
    loading: boolean;
    error: boolean;

    clientLoad: (query: MenuRequest.ClientGetQuery) => Promise<void>;
    adminLoad: (query: MenuRequest.AdminGetQuery) => Promise<void>;
    
    createMenu: (query: MenuRequest.CreateQuery) => Promise<void>;
    removeMenu: (query: MenuRequest.RemoveQuery) => Promise<void>;
    updateMenu: (query: MenuRequest.UpdateQuery) => Promise<void>;

    createMenuCategory: (query: MenuCategoryRequest.CreateQuery) => Promise<void>;
    removeMenuCategory: (query: MenuCategoryRequest.RemoveQuery) => Promise<void>;
    updateMenuCategory: (query: MenuCategoryRequest.UpdateQuery) => Promise<void>;

    // 다른 store에서 사용하기 위해 노출. component에서 사용하지 않음.
    _setMenus: (menus: Schema.Menu[]) => void;
}

const useMenuStore = create<MenuState>((set, get) => ({
    menuCategories: [],
    menus: [],
    loading: false,
    error: false,

    clientLoad: async (query: MenuRequest.ClientGetQuery) => queryStore<MenuRequest.ClientGetQuery, MenuResponse.ClientGet>({
        route: "menu",
        method: "get",
        query,
        setter: set,
        onSuccess: (res) => set({ 
                menus: res.result.flatMap((menuCategory) => menuCategory.menus),
                menuCategories: res.result.map((menuCategory) => ({ ...menuCategory, menus: undefined }))
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
        onSuccess: (res) => console.debug(res),
    }),

    removeMenu: async (query: MenuRequest.RemoveQuery) => queryStore<MenuRequest.RemoveQuery, MenuResponse.Remove>({
        route: "menu",
        method: "delete",
        query,
        setter: set,
        onSuccess: (res) => console.debug(res),
    }),

    updateMenu: async (query: MenuRequest.UpdateQuery) => queryStore<MenuRequest.UpdateQuery, MenuResponse.Update>({
        route: "menu",
        method: "put",
        query,
        setter: set,
        onSuccess: (res) => console.debug(res),
    }),

    createMenuCategory: async (query: MenuCategoryRequest.CreateQuery) => queryStore<MenuCategoryRequest.CreateQuery, MenuCategoryResponse.Create>({
        route: "menuCategory",
        method: "post",
        query,
        setter: set,
        onSuccess: (res) => console.debug(res),
    }),

    removeMenuCategory: async (query: MenuCategoryRequest.RemoveQuery) => queryStore<MenuCategoryRequest.RemoveQuery, MenuCategoryResponse.Remove>({
        route: "menuCategory",
        method: "delete",
        query,
        setter: set,
        onSuccess: (res) => console.debug(res),
    }),

    updateMenuCategory: async (query: MenuCategoryRequest.UpdateQuery) => queryStore<MenuCategoryRequest.UpdateQuery, MenuCategoryResponse.Update>({
        route: "menuCategory",
        method: "put",
        query,
        setter: set,
        onSuccess: (res) => console.debug(res),
    }),

    _setMenus: (menus: Schema.Menu[]) => set({ menus }),
}));

export default useMenuStore;