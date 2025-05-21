import {z} from "zod";

export const createDeposit  = z.object({
    amount: z.number(),
    bank: z.string(),
    timestamp: z.number(),
    name: z.string(),
})