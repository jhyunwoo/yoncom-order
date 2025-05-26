import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, Variables } from "api/lib/bindings";
import initializeDb from "api/lib/initialize-db";

import {
  createValidation,
  removeValidation,
  updateValidation,
} from "shared/api/types/requests/admin/table";
import {
  createTable,
  getTables,
  removeTable,
  updateTable,
} from "api/controller/admin/table.controller";
import { occupyValidation } from "shared/api/types/requests/table";
import { occupyTable } from "api/controller/table.controller";
import { ContentfulStatusCode } from "hono/utils/http-status";

const adminTable = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Create Table
adminTable.post("/", zValidator("json", createValidation), async (c) => {
  const db = initializeDb(c.env.DB);

  const { result, error, status } = await createTable(db, c.req.valid("json"));
  return c.json({ result, error }, status);
});

// Remove Table
adminTable.delete("/", zValidator("json", removeValidation), async (c) => {
  const db = initializeDb(c.env.DB);

  const { result, error, status } = await removeTable(db, c.req.valid("json"));
  return c.json({ result, error }, status);
});

//Update Table
adminTable.put("/", zValidator("json", updateValidation), async (c) => {
  const db = initializeDb(c.env.DB);

  const { result, error, status } = await updateTable(db, c.req.valid("json"));
  return c.json({ result, error }, status);
});

// Occupy Table
adminTable.put("/occupy", zValidator("json", occupyValidation), async (c) => {
  const db = initializeDb(c.env.DB);

  const { result, error, status } = await occupyTable(db, c.req.valid("json"));
  return c.json({ result, error }, status as ContentfulStatusCode);
});

// pos에서 테이블 현황을 받아올 때 여기로 접속
// 특정 tableId를 tableIds에 넣으면 해당 테이블만 받아오는 쿼리로 동작
adminTable.get("/", async (c) => {
  const db = initializeDb(c.env.DB);

  const { result, status } = await getTables(db);
  return c.json({ result }, status);
});

export default adminTable;
