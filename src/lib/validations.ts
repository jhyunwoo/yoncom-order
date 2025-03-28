import { z } from "zod";

export const signInValidation = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(255),
});

export const signUpValidation = z.object({
  email: z.string().email().min(5),
  password: z.string().min(8).max(255),
  name: z.string().min(1),
});

export const tableValidation = z.object({
  name: z.string().min(1),
});

export const menuPostValidation = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int(),
  quantity: z.number().int(),
  image: z.string(),
  canOrder: z.boolean(),
});

export const menuPutValidation = z.object({
  id: z.number().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int(),
  quantity: z.number().int(),
  image: z.string(),
  canOrder: z.boolean(),
});

export const orderValidation = z.object({
  tableId: z.string().min(1),
  menuId: z.number().min(1),
  quantity: z.number().int(),
  isCompleted: z.boolean(),
});
