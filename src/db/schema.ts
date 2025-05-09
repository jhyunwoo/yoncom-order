import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateId } from "lucia";
import { v4 as uuidv4 } from "uuid";
import { relations, sql } from "drizzle-orm";

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
export type MenuOrderStatus = (typeof menuOrderStatus)[keyof typeof menuOrderStatus];

export const paymentMethod = {
  NONE: "NONE",
  CASH: "CASH",
  TRANSFER: "TRANSFER",
  AUTO_TRANSFER: "AUTO_TRANSFER",
} as const;
export type PaymentMethod = (typeof paymentMethod)[keyof typeof paymentMethod];

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => generateId(15)),
  role: text("role").$type<UserRole>().default(userRole.UNVERIFIED).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),

  createdAt: text("createdAt").default(sql`(current_timestamp)`),
  updatedAt: text("updatedAt").default(sql`(current_timestamp)`),
  deletedAt: text("deletedAt"),
});

export const userRelations = relations(users, ({ many }) => ({
  menuCategories: many(menuCategories),
  tables: many(tables),
}));

export const menuCategories = sqliteTable("menuCategories", {
  id: text("id").primaryKey().$defaultFn(() => generateId(15)),
  name: text("name").notNull(),
  description: text("description"),

  userId: text("userId").references(() => users.id).notNull(),

  createdAt: text("createdAt").default(sql`(current_timestamp)`),
  updatedAt: text("updatedAt").default(sql`(current_timestamp)`),
  deletedAt: text("deletedAt"),
});

export const menuCategoriesRelations = relations(menuCategories, ({ one, many }) => ({
  user: one(users, {
    fields: [menuCategories.userId],
    references: [users.id],
  }),
  menus: many(menus),
}));

export const menus = sqliteTable("menus", {
  id: text("id").primaryKey().$defaultFn(() => generateId(15)),
  name: text("name").notNull(),
  image: text("image"),
  description: text("description"),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),

  available: integer("available", { mode: "boolean" }).default(true),
  menuCategoryId: text("menuCategoryId").references(() => menuCategories.id).notNull(),

  createdAt: text("createdAt").default(sql`(current_timestamp)`),
  updatedAt: text("updatedAt").default(sql`(current_timestamp)`),
  deletedAt: text("deletedAt"),
});

export const menusRelations = relations(menus, ({ one, many }) => ({
  menuOrders: many(menuOrders),
  menuCategory: one(menuCategories, {
    fields: [menus.menuCategoryId],
    references: [menuCategories.id],
  }),
}));

export const tables = sqliteTable("tables", {
  id: text("id").primaryKey().$defaultFn(() => generateId(15)),
  key: integer("key").notNull(),
  
  name: text("name").notNull(),
  seats: integer("seats").notNull(),

  userId: text("userId").references(() => users.id).notNull(),

  createdAt: text("createdAt").default(sql`(current_timestamp)`),
  updatedAt: text("updatedAt").default(sql`(current_timestamp)`),
  deletedAt: text("deletedAt"),
});

export const tablesRelations = relations(tables, ({ one, many }) => ({
  tableContexts: many(tableContexts),
  user: one(users, {
    fields: [tables.userId],
    references: [users.id],
  }),
}));

export const tableContexts = sqliteTable("tableContext", {
  id: text("id").primaryKey().$defaultFn(() => generateId(15)),

  tableId: text("tableId").references(() => tables.id).notNull(),

  createdAt: text("createdAt").default(sql`(current_timestamp)`),
  updatedAt: text("updatedAt").default(sql`(current_timestamp)`),
  deletedAt: text("deletedAt"),
});

export const tableContextRelations = relations(tableContexts, ({ one, many }) => ({
  table: one(tables, {
    fields: [tableContexts.tableId],
    references: [tables.id],
  }),
  orders: many(orders),
}));

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey().notNull().$defaultFn(() => uuidv4()),

  tableContextId: text("tableContextId").references(() => tableContexts.id).notNull(),
  
  createdAt: text("createdAt").notNull().default(sql`(current_timestamp)`),
  updatedAt: text("updatedAt").notNull().default(sql`(current_timestamp)`),
  deletedAt: text("deletedAt"),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  tableContext: one(tableContexts, {
    fields: [orders.tableContextId],
    references: [tableContexts.id],
  }),
  menuOrders: many(menuOrders),
}));

export const menuOrders = sqliteTable("menuOrders", {
  id: text("id").primaryKey().$defaultFn(() => generateId(15)),
  quantity: integer("quantity").notNull(),
  status: text("status").$type<MenuOrderStatus>().default(menuOrderStatus.PENDING).notNull(),

  orderId: text("orderId").references(() => orders.id).notNull(),
  menuId: text("menuId").references(() => menus.id).notNull(),

  createdAt: text("createdAt").default(sql`(current_timestamp)`),
  updatedAt: text("updatedAt").default(sql`(current_timestamp)`),
  deletedAt: text("deletedAt"),
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

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey().$defaultFn(() => generateId(15)),
  paid: integer("paid", { mode: "boolean" }).notNull().default(false),
  method: text("method").$type<PaymentMethod>().default(paymentMethod.NONE).notNull(),
  amount: integer("amount").notNull(),
  received: integer("received"),
  
  createdAt: text("createdAt").default(sql`(current_timestamp)`),
  updatedAt: text("updatedAt").default(sql`(current_timestamp)`),
  deletedAt: text("deletedAt"),
});
