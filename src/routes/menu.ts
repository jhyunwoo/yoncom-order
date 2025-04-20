import { Hono } from "hono";
import { Bindings, Variables } from "../lib/bindings";
import initializeDb from "../db/initialize-db";

const menu = new Hono<{ Bindings: Bindings; Variables: Variables }>();

menu.get("/", async (c) => {
  const db = initializeDb(c.env.DB);

  const menuList = await db.query.menus.findMany();
  const orderList = await db.query.orders.findMany({
    columns: {
      quantity: true,
      menuId: true,
    },
  });

  const menuIdList = menuList.map((menu) => menu.id);
  const menuOrderedList: number[] = new Array(menuIdList.length).fill(0);

  for (const order of orderList) {
    if (menuIdList.includes(order.menuId)) {
      menuOrderedList[menuIdList.indexOf(order.menuId)] += order.quantity;
    }
  }

  const menus = [];

  for (const menu of menuList) {
    menus.push({
      ...menu,
      ordered: menuOrderedList[menuIdList.indexOf(menu.id)],
    });
  }

  return c.json(menus);
});
