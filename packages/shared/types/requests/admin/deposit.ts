import {z} from "zod";

export const createValidation  = z.object({
    amount: z.number(),
    bank: z.string(),
    timestamp: z.number(),
    name: z.string(),
})
export type Create = z.infer<typeof createValidation>;