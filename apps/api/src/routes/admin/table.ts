import { Hono } from "hono";
import { Bindings, Variables } from "api/lib/bindings";
import { zValidator } from "@hono/zod-validator";
import { adminGetTableValidation, createTableValidation, deleteTableValidation, occupyTableValidation, updateTableValidation, vacateTableValidation } from "api/lib/validations";
import initializeDb from "api/lib/initialize-db";
import * as TableController from "api/controller/table.controller";

const adminTable = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Create Table
adminTable.post("/", zValidator("json", createTableValidation),
  async (c) => {
    const db = initializeDb(c.env.DB);
    const userId = c.get("user")!.id;

    console.debug(userId, c.req.valid("json"));

    const { result, status } = 
      await TableController.create(db, userId, c.req.valid("json"));
    return c.json({ result }, status);
});

// Remove Table
adminTable.delete("/", zValidator("json", deleteTableValidation),
  async (c) => {
    const db = initializeDb(c.env.DB);
    const userId = c.get("user")!.id;

    const { result, status } = 
      await TableController.remove(db, userId, c.req.valid("json"));
    return c.json({ result }, status);
  },
);

//Update Table
adminTable.put("/update", zValidator("json", updateTableValidation),
  async (c) => {
    const db = initializeDb(c.env.DB);
    const userId = c.get("user")!.id;

    const { result, status } = 
      await TableController.update(db, userId, c.req.valid("json"));
    return c.json({ result }, status);
  },
);

// Occupy Table
adminTable.put("/occupy", zValidator("json", occupyTableValidation),
  async (c) => {
    const db = initializeDb(c.env.DB);
    const userId = c.get("user")!.id;

    const { result, status } = 
      await TableController.occupy(db, userId, c.req.valid("json"));
    return c.json({ result }, status);
  },
);

// Vacate Table
adminTable.put("/vacate", zValidator("json", vacateTableValidation),
  async (c) => {
    const db = initializeDb(c.env.DB);
    const userId = c.get("user")!.id;

    const { result, status } = 
      await TableController.vacate(db, userId, c.req.valid("json"));
    return c.json({ result }, status);
  },
);

// pos에서 테이블 현황을 받아올 때 여기로 접속
// 특정 tableId를 tableIds에 넣으면 해당 테이블만 받아오는 쿼리로 동작
adminTable.get("/", zValidator("json", adminGetTableValidation),
  async (c) => {
    const db = initializeDb(c.env.DB);
    const userId = c.get("user")!.id;

    console.debug(userId, c.req.valid("json"));

    const { result, status } = 
      await TableController.adminGet(db, userId, c.req.valid("json"));
    return c.json({ result }, status);
  }
);

export default adminTable;