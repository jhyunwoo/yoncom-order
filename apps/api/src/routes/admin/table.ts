import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Bindings, Variables } from "api/lib/bindings";
import initializeDb from "api/lib/initialize-db";
import * as TableRequest from "shared/api/types/requests/table";
import * as TableController from "api/controller/table.controller";

const adminTable = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Create Table
adminTable.post("/", zValidator("json", TableRequest.createValidation),
  async (c) => {
    const db = initializeDb(c.env.DB);
    const userId = c.get("user")!.id;

    console.debug(userId, c.req.valid("json"));

    const { result, error, status } = 
      await TableController.create(db, userId, c.req.valid("json"));
    return c.json({ result, error }, status);
});

// Remove Table
adminTable.delete("/", zValidator("json", TableRequest.removeValidation),
  async (c) => {
    const db = initializeDb(c.env.DB);
    const userId = c.get("user")!.id;

    const { result, error, status } = 
      await TableController.remove(db, userId, c.req.valid("json"));
    return c.json({ result, error }, status);
  },
);

//Update Table
adminTable.put("/", zValidator("json", TableRequest.updateValidation),
  async (c) => {
    const db = initializeDb(c.env.DB);
    const userId = c.get("user")!.id;

    const { result, error, status } = 
      await TableController.update(db, userId, c.req.valid("json"));
    return c.json({ result, error }, status);
  },
);

// Occupy Table
adminTable.put("/occupy", zValidator("json", TableRequest.occupyValidation),
  async (c) => {
    const db = initializeDb(c.env.DB);
    const userId = c.get("user")!.id;

    const { result, error, status } = 
      await TableController.occupy(db, userId, c.req.valid("json"));
    return c.json({ result, error }, status);
  },
);

// Vacate Table
adminTable.put("/vacate", zValidator("json", TableRequest.vacateValidation),
  async (c) => {
    const db = initializeDb(c.env.DB);
    const userId = c.get("user")!.id;

    const { result, error, status } = 
      await TableController.vacate(db, userId, c.req.valid("json"));
    return c.json({ result, error }, status);
  },
);

// pos에서 테이블 현황을 받아올 때 여기로 접속
// 특정 tableId를 tableIds에 넣으면 해당 테이블만 받아오는 쿼리로 동작
adminTable.get("/", zValidator("query", TableRequest.adminGetValidation),
  async (c) => {
    const db = initializeDb(c.env.DB);
    const userId = c.get("user")!.id;

    const { result, status } = 
      await TableController.adminGet(db, userId, c.req.valid("query"));
    return c.json({ result }, status);
  }
);

export default adminTable;