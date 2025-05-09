import { and, eq, isNull, asc, sql } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { tables, tableContexts } from "~/db/schema";
import { createTableValidation, deleteTableValidation, occupyTableValidation, updateTableValidation, vacateTableValidation } from "~/lib/validations";
import { z } from "zod";
import * as Q from "~/db/queries";

export const create = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  userId: string,
  query: z.infer<typeof createTableValidation>
): Promise<{ result: string; status: ContentfulStatusCode }> => {
  const { tableOptions } = query;

  try {
    const key = (await db.query.tables.findMany({
      where: and(
        eq(tables.userId, userId),
        isNull(tables.deletedAt)
      ),
      orderBy: [asc(tables.key)],
      columns: { key: true },
    })).reduce((acc, table) => (acc === table.key ? acc + 1 : acc), 1);

    await db
      .insert(tables)
      .values({ ...tableOptions, key, userId });
    return { result: "Table created", status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Insert Error", status: 500 };
  }
}

export const remove = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  userId: string,
  query: z.infer<typeof deleteTableValidation>
): Promise<{ result: string; status: ContentfulStatusCode }> => {
  const { tableId } = query;

  try {
    // 유저가 테이블 소유자가 맞는지
    const isTableOwnedByUser = await Q.isTablesOwnedByUser(db, userId, [tableId]);
    if (!isTableOwnedByUser)
      return { result: "Table Not Found", status: 404 };

    // 해당 테이블에 활성화 중인 tableContext가 있는지 확인
    const exists = await db
      .select({ exists: sql<boolean>`1` })
      .from(tableContexts)
      .where(and(
          eq(tableContexts.tableId, query.tableId),
          isNull(tableContexts.deletedAt)
        ))
        .limit(1)
        .then(rows => rows.length > 0);

    if (exists)
      return { result: "Table is on use", status: 404 };

    await db
      .update(tables)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(tables.id, query.tableId));

    return { result: "Table deleted", status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Delete Error", status: 500 };
  }
}

export const vacate = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  userId: string,
  query: z.infer<typeof vacateTableValidation>
): Promise<{ result: string; status: ContentfulStatusCode }> => {
  const { tableId } = query;

  try {
    // 유저가 테이블 소유자가 맞는지
    const isTableOwnedByUser = await Q.isTablesOwnedByUser(db, userId, [tableId]);
    if (!isTableOwnedByUser)
      return { result: "Table Not Found", status: 404 };

    // 해당 테이블에 활성화 중인 tableContext가 있는지 확인
    const isTableActive = await Q.isTablesActive(db, [tableId]);
    if (!isTableActive)
      return { result: "Table is not active", status: 404 };

    // 해당 테이블에 끝나지 않은 주문이 있는지


    await db
      .update(tables)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(tables.id, query.tableId));

    return { result: "Table vacated", status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Update Error", status: 500 };
  }
}

export const occupy = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  userId: string,
  query: z.infer<typeof occupyTableValidation>
): Promise<{ result: string; status: ContentfulStatusCode }> => {
  const { tableId } = query;

  try {
    // 유저가 테이블 소유자가 맞는지
    const isTableOwnedByUser = await Q.isTablesOwnedByUser(db, userId, [tableId]);
    if (!isTableOwnedByUser)
      return { result: "Table Not Found", status: 404 };

    // 해당 테이블에 비활성화 중인지 확인
    const isTableActive = await Q.isTablesActive(db, [tableId]);
    if (isTableActive)
      return { result: "Table is already occupied", status: 404 };

    await db
      .insert(tableContexts)
      .values({ tableId });

    return { result: "Table occupied", status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Insert Error", status: 500 };
  }
}

export const update = async (
  db: DrizzleD1Database<typeof import("~/db/schema")> & { $client: D1Database; },
  userId: string,
  query: z.infer<typeof updateTableValidation>
): Promise<{ result: string; status: ContentfulStatusCode }> => {
  const { tableId, tableOptions } = query;

  try {
    // 유저가 테이블 소유자가 맞는지
    const isTableOwnedByUser = await Q.isTablesOwnedByUser(db, userId, [tableId]);
    if (!isTableOwnedByUser)
      return { result: "Table Not Found", status: 404 };  
    
    await db
      .update(tables)
      .set(tableOptions)
      .where(eq(tables.id, tableId));   

    return { result: "Table updated", status: 200 };
  } catch (e) {
    console.error(e);
    return { result: "DB Update Error", status: 500 };
  }
}
