import { z } from "zod";

export const createValidation = z.object({
  tableOptions: z.object({
    name: z.string().min(1),
    seats: z.number().int().min(1),
  }),
});
export type Create = z.infer<typeof createValidation>;

export const removeValidation = z.object({
  tableId: z.string().length(15),
});
export type Remove = z.infer<typeof removeValidation>;

export const vacateValidation = z.object({
  tableId: z.string().length(15),
});
export type Vacate = z.infer<typeof vacateValidation>;

export const updateValidation = z.object({
  tableId: z.string().length(15),
  tableOptions: z.object({
    name: z.string().min(1).optional(),
    seats: z.number().int().min(1).optional(),
  }),
});
export type Update = z.infer<typeof updateValidation>;

export const occupyValidation = z.object({
  tableId: z.string().length(15),
});
export type Occupy = z.infer<typeof occupyValidation>;

export const getValidation = z.object({
  tableIds: z.array(z.string().length(15)).optional(),
});
export type Get = z.infer<typeof getValidation>;
