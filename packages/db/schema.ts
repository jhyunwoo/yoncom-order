import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateId } from "lucia";
import { relations } from "drizzle-orm";

export const userRole = {
  UNVERIFIED: "UNVERIFIED",
  ADMIN: "ADMIN",
  USER: "USER",
} as const;
export type UserRole = (typeof userRole)[keyof typeof userRole];
export const menuOrderStatus = {
  PENDING: "PENDING",
  SERVED: "SERVED",
  CANCELLED: "CANCELLED",
} as const;
export type MenuOrderStatus =
  (typeof menuOrderStatus)[keyof typeof menuOrderStatus];

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at").notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  role: text("role").notNull().$type<UserRole>().default(userRole.UNVERIFIED),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),

  createdAt: integer("createdAt")
    .notNull()
    .$defaultFn(() => Date.now()),
  updatedAt: integer("updatedAt")
    .notNull()
    .$defaultFn(() => Date.now()),
  deletedAt: integer("deletedAt"),
});

export const userRelations = relations(users, ({ many }) => ({
  menuCategories: many(menuCategories),
  tables: many(tables),
}));

export type User = typeof users.$inferSelect;

export const menuCategories = sqliteTable("menuCategories", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  name: text("name").notNull(),
  description: text("description").notNull(),

  createdAt: integer("createdAt")
    .notNull()
    .$defaultFn(() => Date.now()),
  updatedAt: integer("updatedAt")
    .notNull()
    .$defaultFn(() => Date.now()),
  deletedAt: integer("deletedAt"),
});

export const menuCategoriesRelations = relations(
  menuCategories,
  ({ many }) => ({
    menus: many(menus),
  }),
);

export type MenuCategory = typeof menuCategories.$inferSelect;

export const menus = sqliteTable("menus", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  name: text("name").notNull(),
  image: text("image").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
  available: integer("available", { mode: "boolean" }).notNull().default(true),
  menuCategoryId: text("menuCategoryId")
    .notNull()
    .references(() => menuCategories.id),

  createdAt: integer("createdAt")
    .notNull()
    .$defaultFn(() => Date.now()),
  updatedAt: integer("updatedAt")
    .notNull()
    .$defaultFn(() => Date.now()),
  deletedAt: integer("deletedAt"),
});

export const menusRelations = relations(menus, ({ one, many }) => ({
  menuOrders: many(menuOrders),
  menuCategory: one(menuCategories, {
    fields: [menus.menuCategoryId],
    references: [menuCategories.id],
  }),
}));

export type Menu = typeof menus.$inferSelect;

export const tables = sqliteTable("tables", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  key: integer("key").notNull(),
  name: text("name").notNull().unique(),
  seats: integer("seats").notNull(),
  createdAt: integer("createdAt")
    .notNull()
    .$defaultFn(() => Date.now()),
  updatedAt: integer("updatedAt")
    .notNull()
    .$defaultFn(() => Date.now()),
  deletedAt: integer("deletedAt"),
});

export const tablesRelations = relations(tables, ({ many }) => ({
  tableContexts: many(tableContexts),
}));

export type Table = typeof tables.$inferSelect;

export const tableContexts = sqliteTable("tableContexts", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  tableId: text("tableId")
    .notNull()
    .references(() => tables.id),
  createdAt: integer("createdAt")
    .notNull()
    .$defaultFn(() => Date.now()),
  updatedAt: integer("updatedAt")
    .notNull()
    .$defaultFn(() => Date.now()),
  deletedAt: integer("deletedAt"),
});

export const tableContextsRelations = relations(
  tableContexts,
  ({ one, many }) => ({
    table: one(tables, {
      fields: [tableContexts.tableId],
      references: [tables.id],
    }),
    orders: many(orders),
  }),
);

export type TableContext = typeof tableContexts.$inferSelect;

export const orders = sqliteTable("orders", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  tableContextId: text("tableContextId")
    .notNull()
    .references(() => tableContexts.id),
  paymentId: text("paymentId"),
  createdAt: integer("createdAt")
    .notNull()
    .$defaultFn(() => Date.now()),
  updatedAt: integer("updatedAt")
    .notNull()
    .$defaultFn(() => Date.now()),
  deletedAt: integer("deletedAt"),
});

export type Order = typeof orders.$inferSelect;

export const payments = sqliteTable("payments", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  paid: integer("paid", { mode: "boolean" }).notNull().default(false),
  amount: integer("amount").notNull(),
  bank: text("bank"),
  depositor: text("depositor"),
  orderId: text("orderId").references(() => orders.id),
  createdAt: integer("createdAt")
    .notNull()
    .$defaultFn(() => Date.now()),
  updatedAt: integer("updatedAt")
    .notNull()
    .$defaultFn(() => Date.now()),
  deletedAt: integer("deletedAt"),
});

export type Payment = typeof payments.$inferSelect;

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  tableContext: one(tableContexts, {
    fields: [orders.tableContextId],
    references: [tableContexts.id],
  }),
  payment: one(payments, {
    fields: [orders.paymentId],
    references: [payments.id],
  }),
  menuOrders: many(menuOrders),
}));

export const menuOrders = sqliteTable("menuOrders", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  quantity: integer("quantity").notNull(),
  status: text("status")
    .notNull()
    .$type<MenuOrderStatus>()
    .default(menuOrderStatus.PENDING),

  orderId: text("orderId")
    .notNull()
    .references(() => orders.id),
  menuId: text("menuId")
    .notNull()
    .references(() => menus.id),

  createdAt: integer("createdAt")
    .notNull()
    .$defaultFn(() => Date.now()),
  updatedAt: integer("updatedAt")
    .notNull()
    .$defaultFn(() => Date.now()),
  deletedAt: integer("deletedAt"),
});

export const menuOrdersRelations = relations(menuOrders, ({ one }) => ({
  order: one(orders, {
    fields: [menuOrders.orderId],
    references: [orders.id],
  }),
  menu: one(menus, {
    fields: [menuOrders.menuId],
    references: [menus.id],
  }),
}));

export type MenuOrder = typeof menuOrders.$inferSelect;
