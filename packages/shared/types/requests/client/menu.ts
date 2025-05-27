import { z } from "zod";

export const getValidation = z.object({
});
export type Get = z.infer<typeof getValidation>;
