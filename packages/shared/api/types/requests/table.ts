import { z } from "zod";

export const getValidation = z.object({
  tableId: z.string().length(15),
});

export const occupyValidation = z.object({
  tableId: z.string().length(15),
});

export type GetTable = z.infer<typeof getValidation>;
export type OccupyTable = z.infer<typeof occupyValidation>;
