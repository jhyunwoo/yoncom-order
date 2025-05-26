import { z } from "zod";

export const getValidation = z.object({
  userId: z.string().length(15),
});
export type Get = z.infer<typeof getValidation>;