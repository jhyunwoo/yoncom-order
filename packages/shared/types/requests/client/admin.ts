import { z } from "zod";

export const heartBeatValidation = z.object({
});
export type HeartBeat = z.infer<typeof heartBeatValidation>;