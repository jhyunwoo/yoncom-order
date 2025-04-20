import { Hono } from "hono";
import { Bindings, Variables } from "../../lib/bindings";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const image = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const fileSchema = z
  .custom<File>(
    (file) => {
      return file instanceof File;
    },
    {
      message: "유효한 파일이 아닙니다.",
    },
  )
  .refine((file) => file.type.startsWith("image/"), {
    message: "이미지 파일만 업로드 가능합니다.",
  });

image.post(
  "/",
  zValidator("form", z.object({ folder: z.string(), file: fileSchema })),
  async (c) => {
    const { folder, file } = c.req.valid("form");
    const randomFilename =
      folder + "/" + crypto.randomUUID() + "." + file.name.split(".").pop();

    try {
      await c.env.R2.put(randomFilename, file);
    } catch (e) {
      console.error(e);
      return c.json({ error: "File Upload Error" }, 500);
    }

    return c.json({ filename: randomFilename });
  },
);

export default image;
