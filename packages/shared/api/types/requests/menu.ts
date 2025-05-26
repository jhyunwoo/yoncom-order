import {z} from "zod";

export const getValidation = z.object({
    userId: z.string().length(15),
});
export type ClientGetQuery = z.infer<typeof getValidation>;