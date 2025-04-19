import { Hono } from "hono";
import { Bindings, Variables } from "../lib/bindings";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const deposit = new Hono<{ Bindings: Bindings; Variables: Variables }>();

deposit.post(
  "/",
  zValidator(
    "json",
    z.array(
      z.object({
        amount: z.number().min(1),
        bank: z.string().min(1),
        name: z.string().min(1),
        timestamp: z.number().min(1),
      }),
    ),
  ),
  async (c) => {
    const deposits = c.req.valid("json");

    console.log(deposits);

    return c.json({ result: "success" });
  },
);

export default deposit;
