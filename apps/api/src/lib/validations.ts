import { z } from "zod";

export const signUpValidation = z.object({
  email: z.string().email().min(5),
  password: z.string().min(8).max(255),
  name: z.string().min(1),
});

export const signInValidation = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(255),
});

export const createTableValidation = z.object({
  tableOptions: z.object({
    name: z.string().min(1),
    seats: z.number().int().min(1),
  }),
});

export const deleteTableValidation = z.object({
  tableId: z.string().length(15),
});

export const vacateTableValidation = z.object({
  tableId: z.string().length(15),
});

export const updateTableValidation = z.object({
  tableId: z.string().length(15),
  tableOptions: z.object({
    name: z.string().min(1).optional(),
    seats: z.number().int().min(1).optional(),
  }),
});

export const occupyTableValidation = z.object({
  tableId: z.string().length(15),
});

export const createMenuValidation = z.object({
  menuOptions: z.object({
    name: z.string().min(1),
    image: z.string(),
    description: z.string().min(1),
    price: z.number().int(),
    quantity: z.number().int(),
    menuCategoryId: z.string().length(15),
    available: z.boolean(),
  }),
});

export const updateMenuValidation = z.object({
  menuId: z.string().length(15),
  menuOptions: z.object({
    name: z.string().min(1),
    image: z.string(),
    description: z.string().min(1),
    price: z.number().int(),
    quantity: z.number().int(),
    menuCategoryId: z.string().length(15),
    available: z.boolean(),
  }),
});

export const deleteMenuValidation = z.object({
  menuId: z.string().length(15),
});

export const getMenuValidation = z.object({
  userId: z.string().length(15),
  menuCategoryIds: z.array(z.string().length(15)).optional(),
});

export const createOrderValidation = z.object({
  tableId: z.string().length(15),
  menuOrders: z.array(z.object({
    menuId: z.string().length(15),
    quantity: z.number().int().min(1),
  })),
});

export const getOrderValidation = z.object({
  orderId: z.string().length(15),
});

export const clientGetTableValidation = z.object({
  tableId: z.string().length(15),
});

export const adminGetTableValidation = z.object({
  tableIds: z.array(z.string().length(15)).optional(),
});