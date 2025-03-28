import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateId } from "lucia";
import { v4 as uuidv4 } from "uuid";
import { relations, sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateId(15)),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: text("createdAt").$defaultFn(() => String(new Date())),
  role: text("role").notNull().default("unverified"),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at").notNull(),
});

export const menus = sqliteTable("menus", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
  image: text("image"),
  canOrder: integer("canOrder", { mode: "boolean" }).default(true),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const menusRelations = relations(menus, ({ many }) => ({
  orders: many(orders),
}));

export const tables = sqliteTable("tables", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => uuidv4()),
  name: text("name").notNull().unique(),
  customerToken: text("customerToken"),
  tokenKey: text("tokenKey"),
  tokenIv: text("tokenIv"),
});

export const tablesRelations = relations(tables, ({ many }) => ({
  orders: many(orders),
}));

export const orders = sqliteTable("orders", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => uuidv4()),
  tableId: text("tableId")
    .references(() => tables.id)
    .notNull(),
  menuId: integer("menuId")
    .references(() => menus.id)
    .notNull(),
  customerToken: text("customerToken").notNull(),
  quantity: integer("quantity").notNull(),
  isCompleted: integer("isCompleted", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updatedAt")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const ordersRelations = relations(orders, ({ one }) => ({
  menu: one(menus, {
    fields: [orders.menuId],
    references: [menus.id],
  }),
  table: one(tables, {
    fields: [orders.tableId],
    references: [tables.id],
  }),
}));
