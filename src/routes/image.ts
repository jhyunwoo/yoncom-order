import { Hono } from "hono";
import { Bindings, Variables } from "../lib/bindings";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import getPreSignedUrl from "../lib/get-pre-signed-url";

const image = new Hono<{ Bindings: Bindings; Variables: Variables }>();

image.post(
  "/",
  zValidator(
    "json",
    z.object({ folder: z.string(), type: z.string(), fileName: z.string() }),
  ),
  async (c) => {
    const { folder, type, fileName } = c.req.valid("json");
    const randomFilename = crypto.randomUUID();
    const uploadUrl = await getPreSignedUrl(
      folder + randomFilename + "." + fileName.split(".").at(-1),
      type,
      `https://${c.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/yoncom-order`,
      c.env.R2_ACCESS_KEY,
      c.env.R2_SECRET_ACCESS_KEY,
    );

    return c.json({ uploadUrl });
  },
);

export default image;
