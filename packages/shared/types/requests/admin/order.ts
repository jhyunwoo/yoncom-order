import { z } from "zod";

export const createValidation = z.object({
  tableId: z.string().length(15),
  menuOrders: z.array(
    z.object({
      menuId: z.string().length(15),
      quantity: z.number().int().min(1),
    }),
  ),
});
export type CreateOrder = z.infer<typeof createValidation>;

export const getValidation = z.object({
  orderId: z.string().length(15),
});
export type GetOrderQuery = z.infer<typeof getValidation>;

export const deleteValidation = z.object({
  orderId: z.string().length(15),
});

export type DeleteOrderQuery = z.infer<typeof deleteValidation>;

export const paidValidation = z.object({
  orderId: z.string().length(15),
});
export type PaidOrder = z.infer<typeof paidValidation>;
