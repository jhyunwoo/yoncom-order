import { create } from 'zustand';
import * as TableRequest from 'shared/api/types/requests/table';
import * as TableResponse from 'shared/api/types/responses/table';
import queryStore from '~/lib/query';
import { toast } from '~/hooks/use-toast';
import useCartStore from './cart.store';

type TableState = {
  clientTable: TableResponse.ClientGet["result"] | null;
  tables: TableResponse.AdminGet["result"];
  isLoaded: boolean;
  error: boolean;

  load: (query: TableRequest.AdminGetQuery) => Promise<TableResponse.AdminGet | null>;

  createTable: (query: TableRequest.CreateQuery) => Promise<TableResponse.Create | null>;
  removeTable: (query: TableRequest.RemoveQuery) => Promise<TableResponse.Remove | null>;
  updateTable: (query: TableRequest.UpdateQuery) => Promise<TableResponse.Update | null>;

  occupyTable: (query: TableRequest.OccupyQuery) => Promise<TableResponse.Occupy | null>;
  vacateTable: (query: TableRequest.VacateQuery) => Promise<TableResponse.Vacate | null>;

  clientGetTable: (query: TableRequest.ClientGetQuery) => Promise<TableResponse.ClientGet | null>;

  // 다른 store에서 사용하기 위해 노출. component에서 사용하지 않음.
  _setTables: (tables: TableResponse.AdminGet["result"]) => void;
}

const useTableStore = create<TableState>((set, get) => ({
  clientTable: null,
  tables: [],
  isLoaded: false,
  error: false,

  load: async (query: TableRequest.AdminGetQuery) => await queryStore<TableRequest.AdminGetQuery, TableResponse.AdminGet>({
    route: "admin/table",
    method: "get",
    query,
    setter: set,
    onSuccess: (res) => set({ tables: res.result }),
  }),

  createTable: async (query: TableRequest.CreateQuery) => await queryStore<TableRequest.CreateQuery, TableResponse.Create>({
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

  removeTable: async (query: TableRequest.RemoveQuery) => await queryStore<TableRequest.RemoveQuery, TableResponse.Remove>({
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

  updateTable: async (query: TableRequest.UpdateQuery) => await queryStore<TableRequest.UpdateQuery, TableResponse.Update>({
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

  occupyTable: async (query: TableRequest.OccupyQuery) => await queryStore<TableRequest.OccupyQuery, TableResponse.Occupy>({
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

  vacateTable: async (query: TableRequest.VacateQuery) => await queryStore<TableRequest.VacateQuery, TableResponse.Vacate>({
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

  clientGetTable: async (query: TableRequest.ClientGetQuery) => await queryStore<TableRequest.ClientGetQuery, TableResponse.ClientGet>({
    route: "table",
    method: "get",
    query,
    setter: set,
    onSuccess: (res) => {
      set({ clientTable: res.result });
      set({ orders: res.result.tableContexts[0].orders });
    },
  }),

  _setTables: (tables: TableResponse.AdminGet["result"]) => set({ tables }),
}));

export default useTableStore;