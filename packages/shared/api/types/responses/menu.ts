import * as Schema from "db/schema";

export type Create = {
  result: string;
}

export type Update = {
  result: string;
}

export type Remove = {
  result: string;
}

export type ClientGet = {
  result: (Schema.MenuCategory & {
    menus: Schema.Menu[]
  })[];
}

export type AdminGet = {
  result: (Schema.MenuCategory & {
    menus: Schema.Menu[];
  })[];
}