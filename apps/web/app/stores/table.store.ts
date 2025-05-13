import { create } from 'zustand';
import * as TableRequest from 'shared/api/types/requests/table';
import * as TableResponse from 'shared/api/types/responses/table';
import queryStore from 'web/app/lib/query';
import { toast } from '~/hooks/use-toast';

type TableState = {
  tables: TableResponse.AdminGet["result"];
  isLoaded: boolean;
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
  isLoaded: false,
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
    onSuccess: (res) => toast({
      title: "테이블 생성 완료",
      description: "테이블이 성공적으로 생성되었습니다.",
      duration: 3000,
    }),
  }),

  removeTable: async (query: TableRequest.RemoveQuery) => queryStore<TableRequest.RemoveQuery, TableResponse.Remove>({
    route: "admin/table",
    method: "delete",
    query,
    setter: set,
    onSuccess: (res) => toast({
      title: "테이블 제거 완료",
      description: "테이블이 성공적으로 제거되었습니다.",
      duration: 3000,
    }),
  }),

  updateTable: async (query: TableRequest.UpdateQuery) => queryStore<TableRequest.UpdateQuery, TableResponse.Update>({
    route: "admin/table",
    method: "put",
    query,
    setter: set,
    onSuccess: (res) => toast({
      title: "테이블 수정 완료",
      description: "테이블이 성공적으로 수정되었습니다.",
      duration: 3000,
    }),
  }),

  occupyTable: async (query: TableRequest.OccupyQuery) => queryStore<TableRequest.OccupyQuery, TableResponse.Occupy>({
    route: "admin/table/occupy",
    method: "put",
    query,
    setter: set,
    onSuccess: (res) => toast({
      title: "테이블 점유 완료",
      description: "테이블이 성공적으로 점유되었습니다.",
      duration: 3000,
    }),
  }),

  vacateTable: async (query: TableRequest.VacateQuery) => queryStore<TableRequest.VacateQuery, TableResponse.Vacate>({
    route: "admin/table/vacate",
    method: "put",
    query,
    setter: set,
    onSuccess: (res) => toast({
      title: "테이블 비우기 완료",
      description: "테이블이 성공적으로 비워졌습니다.",
      duration: 3000,
    }),
  }),

  _setTables: (tables: TableResponse.AdminGet["result"]) => set({ tables }),
}));

export default useTableStore;