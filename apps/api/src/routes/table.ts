import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, Variables } from "api/lib/bindings";
import initializeDb from "api/lib/initialize-db";
import { getValidation } from "shared/types/requests/client/table";
import { getTable } from "api/controller/table.controller";
import { ContentfulStatusCode } from "hono/utils/http-status";

const table = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// 특정 테이블 조회 - 고객 QR용
table.get("/", zValidator("query", getValidation), async (c) => {
  const db = initializeDb(c.env.DB);

  const { result, error, status } = await getTable(db, c.req.valid("query"));
  return c.json({ result, error }, status as ContentfulStatusCode);
});

export default table;
