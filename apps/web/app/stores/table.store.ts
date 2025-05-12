import { create } from 'zustand';
import * as Schema from 'db/schema';
import ky from 'ky';
import { z } from 'zod';
import { adminGetTableValidation, createTableValidation, removeTableValidation, updateTableValidation } from 'shared/api/validations/validations';
import { API_BASE_URL } from 'shared/constants';
import { APIResponse } from 'shared/api/types/responses/table';

type TableState = {
  tables: Schema.Table[];
  loading: boolean;
  error: boolean;

  loadTables: (query: z.infer<typeof adminGetTableValidation>) => Promise<void>;
  createTable: (query: z.infer<typeof createTableValidation>) => Promise<void>;
  removeTable: (query: z.infer<typeof removeTableValidation>) => Promise<void>;
  updateTable: (query: z.infer<typeof updateTableValidation>) => Promise<void>;

  _setTables: (tables: Schema.Table[]) => void;
  _openTable: (tableId: string, context: string) => Promise<void>;
  _closeTable: (tableId: string) => Promise<void>;
}

const useTableStore = create<TableState>((set, get) => ({
  tables: [],
  loading: false,
  error: false,

  loadTables: async (query: z.infer<typeof adminGetTableValidation>) => {
    const URL = API_BASE_URL + "/admin/table";

    set({ loading: true, error: false });
    try {
      const res = await ky.get(URL, { json: { query } }).json<APIResponse>();

      set({ tables: res.result as Schema.Table[], loading: false, error: false });
      console.debug("Table Loaded:", res.result);
    } catch (error) {
      console.error("Failed to fetch tables:", error);
      set({
        tables: [],
        loading: false,
        error: true,
      });
    }
  },

  createTable: async (query: z.infer<typeof createTableValidation>) => {
    const URL = API_BASE_URL + "/admin/table";

    set({ loading: true, error: false });
    try {
      const res = await ky.post(URL, { json: { query } }).json<APIResponse>();

      set((state) => ({
        tables: [...state.tables, res.data as Type.Table],
        loading: false,
        error: false
      }));
      console.debug("Table created:", res.data);
    } catch (error) {
      console.error("Failed to create table:", error);
      set({
        loading: false,
        error: true
      });
    }
  },

  removeTable: async (query: z.infer<typeof removeTableValidation>) => {
    set({ loading: true, error: false });
    try {
      const res = await ky.get(`http://localhost:8000/api/tables/${query.tableId}/delete`).json<Type.Response<Type.Table>>();
      set((state) => ({
        tables: state.tables.filter((table) => table.id !== tableId),
        loading: false,
        error: false
      }));
      console.debug("Table deleted:", res.data);
    } catch (error) {
      console.error("Failed to delete table:", error);
      set({
        loading: false,
        error: true
      });
    }
  },

  updateTable: async (query: z.infer<typeof updateTableValidation>) => {
    throw new Error("Not implemented");
    set({ loading: true, error: false });
    try {
      const res = await ky.put(`/api/tables/${tableId}/rename`, {
        json: { name }
      }).json<Type.Response<Type.Table>>();

      set((state) => ({
        tables: state.tables.map((table) =>
          table.id === tableId ? { ...table, name: tableName } : table
        ),
        loading: false,
        error: false
      }));
      console.debug("Table renamed:", res.data);
    } catch (error) {
      console.error("Failed to rename table:", error);
      set({
        loading: false,
        error: true
      });
    }
  },

  _setTables: (tables: Type.Table[]) => {
    set({ tables });
  },
  _openTable: async (tableId: Type.Id, tableContextId: Type.Id) => {
    set((state) => ({
      tables: state.tables.map((table) => table.id === tableId
        ? { ...table, tableContextId }
        : table
      ),
      loading: false,
      error: false
    }));
  }
  ,
  _closeTable: async (tableId: Type.Id) => {
    set((state) => ({
      tables: state.tables.map((table) => table.id === tableId
        ? { ...table, tableContextId: undefined }
        : table
      ),
      loading: false,
      error: false
    }));
  }
}));

export default useTableStore;