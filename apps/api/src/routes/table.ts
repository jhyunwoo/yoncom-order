import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, Variables } from "api/lib/bindings";
import initializeDb from "api/lib/initialize-db";
import * as TableRequest from "shared/api/types/requests/table";
import * as TableController from "api/controller/table.controller";

const table = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// 특정 테이블 조회 - 고객 QR용
table.get("/", zValidator("query", TableRequest.clientGetValidation), 
  async (c) => {
    const db = initializeDb(c.env.DB);

    const { result, error, status } = 
      await TableController.clientGet(db, c.req.valid("query"));
    return c.json({ result, error }, status);
  }
);

export default table;