import { z } from "zod";

export const signUpValidation = z.object({
  email: z.string().email().min(5),
  password: z.string().min(8).max(255),
  name: z.string().min(1),
});
export type SignUpQuery = z.infer<typeof signUpValidation>;

export const signInValidation = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(255),
});
export type SignInQuery = z.infer<typeof signInValidation>;