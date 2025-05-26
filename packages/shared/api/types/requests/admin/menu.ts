import { z } from "zod";

export const createValidation = z.object({
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
export type CreateMenuQuery = z.infer<typeof createValidation>;

export const updateValidation = z.object({
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
export type UpdateMenuQuery = z.infer<typeof updateValidation>;

export const removeValidation = z.object({
  menuId: z.string().length(15),
});
export type RemoveMenuQuery = z.infer<typeof removeValidation>;
