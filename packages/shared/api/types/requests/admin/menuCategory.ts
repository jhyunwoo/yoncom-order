import { z } from "zod";

export const createValidation = z.object({
  menuCategoryOptions: z.object({
    name: z.string().min(1),
    description: z.string(),
  }),
});
export type CreateMenuCategoryQuery = z.infer<typeof createValidation>;

export const updateValidation = z.object({
  menuCategoryId: z.string().length(15),
  menuCategoryOptions: z.object({
    name: z.string().min(1),
    description: z.string(),
  }),
});
export type UpdateMenuCategoryQuery = z.infer<typeof updateValidation>;

export const removeValidation = z.object({
  menuCategoryId: z.string().length(15),
});
export type RemoveMenuCategoryQuery = z.infer<typeof removeValidation>;