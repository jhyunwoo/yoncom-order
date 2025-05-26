import { z } from "zod";

export const createValidation = z.object({
  name: z.string().min(1),
  seats: z.number().min(1),
});

export const removeValidation = z.object({
  tableId: z.string().length(15),
});

export const vacateValidation = z.object({
  tableId: z.string().length(15),
});

export const updateValidation = z.object({
  tableId: z.string().length(15),
  name: z.string().min(1).optional(),
  seats: z.number().min(1).optional(),
});

export type AdminCreateTable = z.infer<typeof createValidation>;
export type AdminRemoveTable = z.infer<typeof removeValidation>;
export type AdminVacateTable = z.infer<typeof vacateValidation>;
export type AdminUpdateTable = z.infer<typeof updateValidation>;
