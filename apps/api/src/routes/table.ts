import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { Bindings, Variables } from "api/lib/bindings";
import { clientGetTableValidation } from "api/lib/validations";
import * as TableController from "api/controller/table.controller";
import initializeDb from "api/lib/initialize-db";

const table = new Hono<{ Bindings: Bindings; Variables: Variables }>();


// 특정 테이블 조회 - 고객 QR용
table.get("/", zValidator("json", clientGetTableValidation), 
  async (c) => {
    const db = initializeDb(c.env.DB);

    const { result, status } = 
      await TableController.clientGet(db, c.req.valid("json"));
    return c.json({ result }, status);
  }
);

export default table;