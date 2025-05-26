import * as Schema from "db/schema";

export type Get = {
  result: (Schema.MenuCategory & {
    menus: Schema.Menu[]
  })[];
}