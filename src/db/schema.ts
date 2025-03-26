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

export const usersRelations = relations(users, ({ one, many }) => ({
  table: one(tables),
  orders: many(orders),
}));

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at").notNull(),
});

export const menus = sqliteTable("menus", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => uuidv4()),
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
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  customerId: text("customerId").references(() => users.id),
});

export const tablesRelations = relations(tables, ({ one, many }) => ({
  user: one(users, {
    fields: [tables.customerId],
    references: [users.id],
  }),
  orders: many(orders),
}));

export const orders = sqliteTable("orders", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => uuidv4()),
  tableId: integer("tableId")
    .references(() => tables.id)
    .notNull(),
  customerId: text("customerId")
    .references(() => users.id)
    .notNull(),
  menuId: text("menuId")
    .references(() => menus.id)
    .notNull(),
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
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
  }),
  menu: one(menus, {
    fields: [orders.menuId],
    references: [menus.id],
  }),
  table: one(tables, {
    fields: [orders.tableId],
    references: [tables.id],
  }),
}));
