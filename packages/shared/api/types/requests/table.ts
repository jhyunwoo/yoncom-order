import { z } from "zod";

export const createValidation = z.object({
  tableOptions: z.object({
    name: z.string().min(1),
    seats: z.number().int().min(1),
  }),
});
export type CreateQuery = z.infer<typeof createValidation>;

export const removeValidation = z.object({
  tableId: z.string().length(15),
});
export type RemoveQuery = z.infer<typeof removeValidation>;

export const vacateValidation = z.object({
  tableId: z.string().length(15),
});
export type VacateQuery = z.infer<typeof vacateValidation>;

export const updateValidation = z.object({
  tableId: z.string().length(15),
  tableOptions: z.object({
    name: z.string().min(1).optional(),
    seats: z.number().int().min(1).optional(),
  }),
});
export type UpdateQuery = z.infer<typeof updateValidation>;

export const occupyValidation = z.object({
  tableId: z.string().length(15),
});
export type OccupyQuery = z.infer<typeof occupyValidation>;

export const clientGetValidation = z.object({
  tableId: z.string().length(15),
});
export type ClientGetQuery = z.infer<typeof clientGetValidation>;

export const adminGetValidation = z.object({
  tableIds: z.array(z.string().length(15)).optional(),
});
export type AdminGetQuery = z.infer<typeof adminGetValidation>;
