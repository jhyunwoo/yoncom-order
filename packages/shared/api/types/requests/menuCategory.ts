import { z } from "zod";

export const createValidation = z.object({
  menuCategoryOptions: z.object({
    name: z.string().min(1),
    description: z.string(),
  }),
});
export type CreateQuery = z.infer<typeof createValidation>;

export const updateValidation = z.object({
  menuCategoryId: z.string().length(15),
  menuCategoryOptions: z.object({
    name: z.string().min(1),
    description: z.string(),
  }),
});
export type UpdateQuery = z.infer<typeof updateValidation>;

export const removeValidation = z.object({
  menuCategoryId: z.string().length(15),
});
export type RemoveQuery = z.infer<typeof removeValidation>;