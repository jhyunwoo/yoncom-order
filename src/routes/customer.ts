import { Hono } from "hono";
import { Bindings, Variables } from "../lib/bindings";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import initializeDb from "../db/initialize-db";
import { and, eq, isNotNull } from "drizzle-orm";
import { menus, orders, tables } from "../db/schema";
import encryptData from "../lib/encrypt-data";
import { setCookie, getCookie } from "hono/cookie";
import { customerToken } from "../middlewares/customer-token";
import decryptData from "../lib/decrypt-data";

const customer = new Hono<{ Bindings: Bindings; Variables: Variables }>();

customer.use("/order", customerToken);

// Occupy Table
customer.put(
  "/occupy",
  zValidator("json", z.object({ tableId: z.string().min(1) })),
  async (c) => {
    const { tableId } = c.req.valid("json");
    const db = initializeDb(c.env.DB);

    const customerToken = getCookie(c, "customer_token");

    // Check if table is already occupied
    const table = await db.query.tables.findFirst({
      where: and(eq(tables.id, tableId), isNotNull(tables.customerToken)),
    });

    if (customerToken && table?.customerToken === customerToken) {
      return c.json({ result: "Table already occupied by you" });
    }

    if (table) {
      return c.json({ result: "Table already occupied" }, 400);
    }

    const currentDate = String(new Date());

    const { encrypted, key, iv } = await encryptData(currentDate);

    try {
      await db
        .update(tables)
        .set({ customerToken: encrypted, tokenIv: iv, tokenKey: key });
    } catch (e) {
      console.error(e);
      return c.json({ result: "DB Error" }, 500);
    }
    setCookie(c, "customer_token", encrypted, { httpOnly: true, secure: true });
    return c.json({ result: "success" });
  },
);

customer.post(
  "/order",
  zValidator(
    "json",
    z.object({
      tableId: z.string().min(1),
      menuId: z.number().min(1),
      quantity: z.number().min(1),
    }),
  ),
  async (c) => {
    const { tableId, menuId, quantity } = c.req.valid("json");
    const db = initializeDb(c.env.DB);
    const customerToken = c.get("customerToken");

    // Check Customer has table
    if (!customerToken) {
      return c.json({ result: "No Table" });
    }

    const checkTable = await db.query.tables.findFirst({
      where: eq(tables.customerToken, customerToken),
    });

    if (!checkTable || !checkTable.tokenKey || !checkTable.tokenIv) {
      return c.json({ result: "No Table" });
    }

    // Validate customer token
    if (
      new Date(
        await decryptData(
          customerToken,
          checkTable.tokenKey,
          checkTable.tokenIv,
        ),
      ) > new Date()
    ) {
      return c.json({ result: "Error" });
    }

    // Check menu quantity is enough
    const menuQuantity = await db.query.menus.findFirst({
      where: eq(menus.id, menuId),
      columns: {
        quantity: true,
      },
    });

    if (!menuQuantity) {
      return c.json({ result: "Menu not found" }, 404);
    }

    const prevOrders = await db.query.orders.findMany({
      where: eq(orders.menuId, menuId),
      columns: {
        quantity: true,
      },
    });

    const orderedQuantity = prevOrders.reduce((acc, order) => {
      return acc + order.quantity;
    }, 0);

    if (menuQuantity.quantity - orderedQuantity < quantity) {
      return c.json({ result: "Not enough menu quantity" }, 400);
    }

    await db
      .insert(orders)
      .values({ tableId, menuId, quantity, customerToken });
    return c.json({ result: "success" });
  },
);

customer.get("/order", async (c) => {
  const customerToken = c.get("customerToken");
  if (!customerToken) {
    return c.json({ result: "No Table" });
  }

  const db = initializeDb(c.env.DB);

  const userTable = await db.query.tables.findFirst({
    where: eq(tables.customerToken, customerToken),
  });

  if (!userTable) {
    return c.json({ result: "No Table" }, 404);
  }

  const ordersList = await db.query.orders.findMany({
    where: and(
      eq(orders.tableId, userTable.id),
      eq(orders.customerToken, customerToken),
    ),
    with: {
      menu: true,
    },
    columns: {
      customerToken: false,
    },
  });

  return c.json({ orders: ordersList });
});

customer.get("/menu", async (c) => {
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

  return c.json({ menu: menus });
});

export default customer;
