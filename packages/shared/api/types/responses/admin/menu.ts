import {
  adminCreateMenu,
  adminDeleteMenu,
  adminGetMenus,
  adminUpdateMenu,
} from "api/controller/admin/menu.controller";

export type Update = ReturnType<Awaited<typeof adminUpdateMenu>>;

export type Create = ReturnType<Awaited<typeof adminCreateMenu>>;

export type Get = ReturnType<Awaited<typeof adminGetMenus>>;

export type Remove = ReturnType<Awaited<typeof adminDeleteMenu>>;
