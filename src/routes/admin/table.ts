import { Hono } from "hono";
import { Bindings, Variables } from "~/lib/bindings";
import { zValidator } from "@hono/zod-validator";
import { createTableValidation, deleteTableValidation, occupyTableValidation, updateTableValidation, vacateTableValidation } from "~/lib/validations";
import initializeDb from "~/db/initialize-db";
import * as TableController from "~/controller/table.controller";

const adminTable = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Create Table
adminTable.post("/", zValidator("json", createTableValidation),
  async (c) => {
    const db = initializeDb(c.env.DB);
    const userId = c.get("user")!.id;

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
adminTable.put("/", zValidator("json", updateTableValidation),
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

export default adminTable;