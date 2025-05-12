import { z } from "zod";

export const createValidation = z.object({
  tableId: z.string().length(15),
  menuOrders: z.array(z.object({
    menuId: z.string().length(15),
    quantity: z.number().int().min(1),
  })),
});
export type CreateQuery = z.infer<typeof createValidation>;

export const getValidation = z.object({
  orderId: z.string().length(15),
});
export type GetQuery = z.infer<typeof getValidation>;