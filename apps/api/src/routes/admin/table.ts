import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, Variables } from "api/lib/bindings";
import initializeDb from "api/lib/initialize-db";

import {
  createValidation,
  occupyValidation,
  removeValidation,
  updateValidation,
  vacateValidation,
} from "shared/types/requests/admin/table";
import {
  createTable,
  getTables,
  removeTable,
  updateTable,
  occupyTable,
  vacateTable,
} from "api/controller/admin/table.controller";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { and, eq, isNull } from "drizzle-orm";
import { tableContexts } from "db/schema";

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

adminTable.put("/vacate", zValidator("json", vacateValidation), async (c) => {
  const db = initializeDb(c.env.DB);

  const { result, error, status } = await vacateTable(db, c.req.valid("json"));
  return c.json({ result, error }, status as ContentfulStatusCode);
});

adminTable.put("/occupy", zValidator("json", occupyValidation), async (c) => {
  const db = initializeDb(c.env.DB);

  const { tableId } = c.req.valid("json");

  const findTableContext = await db.query.tableContexts.findFirst({
    where: and(
      eq(tableContexts.tableId, tableId),
      isNull(tableContexts.deletedAt),
    ),
  });
  if (findTableContext) {
    return c.json({ error: "이미 사용중인 테이블입니다." }, 400);
  }
  try {
    await db.insert(tableContexts).values({ tableId: tableId });
  } catch (e) {
    return c.json({ error: "테이블 사용중에 문제가 발생했습니다." }, 500);
  }
  return c.json({ result: "Success" }, 200);
});

// pos에서 테이블 현황을 받아올 때 여기로 접속
// 특정 tableId를 tableIds에 넣으면 해당 테이블만 받아오는 쿼리로 동작
adminTable.get("/", async (c) => {
  const db = initializeDb(c.env.DB);

  const { result, status } = await getTables(db);
  return c.json({ result }, status);
});

export default adminTable;
