import { Hono } from "hono";
import { Bindings, Variables } from "api/lib/bindings";
import { zValidator } from "@hono/zod-validator";
import { uploadValidation } from "shared/types/requests/admin/image";
import { generateId } from "lucia";

const image = new Hono<{ Bindings: Bindings; Variables: Variables }>();

image.put("/", zValidator("form", uploadValidation), async (c) => {
  const formData = await c.req.formData();

  const fileExtension = (formData.get("file") as File)?.name.split(".").pop();
  const filename = generateId(15) + (fileExtension ? `.${fileExtension}` : "");

  await c.env.R2_BUCKET.put(filename, formData.get("file") as Blob);

  return c.json({ result: { filename: filename } });
});

export default image;
