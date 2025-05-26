import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, Variables } from "api/lib/bindings";
import initializeDb from "api/lib/initialize-db";
import * as ClientTableRequest from "types/requests/client/table";
import * as ClientTableController from "api/controller/client/table.controller";

const table = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// 특정 테이블 조회 - 고객 QR용
table.get("/", zValidator("query", ClientTableRequest.getValidation), 
  async (c) => {
    const db = initializeDb(c.env.DB);

    const { result, error, status } = 
      await ClientTableController.get(db, c.req.valid("query"));
    return c.json({ result, error }, status);
  }
);

export default table;