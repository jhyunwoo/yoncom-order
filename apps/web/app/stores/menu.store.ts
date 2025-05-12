import { create } from 'zustand';
import * as Schema from 'db/schema';

type MenuState = {
    menus: Schema.Menu[];
    loading: boolean;
    error: boolean;

    _setMenus: (menus: Schema.Menu[]) => void;
}

const useMenuStore = create<MenuState>((set, get) => ({
    menus: [],
    loading: false,
    error: false,

    _setMenus: (menus: Schema.Menu[]) => {
        set({ menus });
    }
}));

export default useMenuStore;