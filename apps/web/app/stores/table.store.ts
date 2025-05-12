import { create } from 'zustand';
import * as TableRequest from 'shared/api/types/requests/table';
import * as TableResponse from 'shared/api/types/responses/table';
import queryStore from 'web/app/lib/query';

type TableState = {
  tables: TableResponse.AdminGet["result"];
  loading: boolean;
  error: boolean;

  load: (query: TableRequest.AdminGetQuery) => Promise<void>;

  createTable: (query: TableRequest.CreateQuery) => Promise<void>;
  removeTable: (query: TableRequest.RemoveQuery) => Promise<void>;
  updateTable: (query: TableRequest.UpdateQuery) => Promise<void>;

  occupyTable: (query: TableRequest.OccupyQuery) => Promise<void>;
  vacateTable: (query: TableRequest.VacateQuery) => Promise<void>;

  // 다른 store에서 사용하기 위해 노출. component에서 사용하지 않음.
  _setTables: (tables: TableResponse.AdminGet["result"]) => void;
}

const useTableStore = create<TableState>((set, get) => ({
  tables: [],
  loading: false,
  error: false,

  load: async (query: TableRequest.AdminGetQuery) => queryStore<TableRequest.AdminGetQuery, TableResponse.AdminGet>({
    route: "admin/table",
    method: "get",
    query,
    setter: set,
    onSuccess: (res) => set({ tables: res.result }),
  }),

  createTable: async (query: TableRequest.CreateQuery) => queryStore<TableRequest.CreateQuery, TableResponse.Create>({
    route: "admin/table",
    method: "post",
    query,
    setter: set,
    onSuccess: (res) => console.debug(res),
  }),

  removeTable: async (query: TableRequest.RemoveQuery) => queryStore<TableRequest.RemoveQuery, TableResponse.Remove>({
    route: "admin/table",
    method: "delete",
    query,
    setter: set,
    onSuccess: (res) => console.debug(res),
  }),

  updateTable: async (query: TableRequest.UpdateQuery) => queryStore<TableRequest.UpdateQuery, TableResponse.Update>({
    route: "admin/table",
    method: "put",
    query,
    setter: set,
    onSuccess: (res) => console.debug(res),
  }),

  occupyTable: async (query: TableRequest.OccupyQuery) => queryStore<TableRequest.OccupyQuery, TableResponse.Occupy>({
    route: "admin/table/occupy",
    method: "put",
    query,
    setter: set,
  }),

  vacateTable: async (query: TableRequest.VacateQuery) => queryStore<TableRequest.VacateQuery, TableResponse.Vacate>({
    route: "admin/table/vacate",
    method: "put",
    query,
    setter: set,
  }),

  _setTables: (tables: TableResponse.AdminGet["result"]) => set({ tables }),
}));

export default useTableStore;