import { create } from 'zustand';
import * as ClientTableRequest from "types/requests/client/table";
import * as ClientTableResponse from "types/responses/client/table";
import * as AdminTableRequest from "types/requests/admin/table";
import * as AdminTableResponse from "types/responses/admin/table";
import queryStore from '~/lib/query';
import { toast } from '~/hooks/use-toast';
import { Table } from 'db/schema';

type TableState = {
  clientTable: ClientTableResponse.Get["result"] | null;
  tables: AdminTableResponse.Get["result"];
  isLoaded: boolean;
  error: boolean;

  load: (query: AdminTableRequest.Get) => Promise<AdminTableResponse.Get | null>;

  createTable: (query: AdminTableRequest.Create) => Promise<AdminTableResponse.Create | null>;
  removeTable: (query: AdminTableRequest.Remove) => Promise<AdminTableResponse.Remove | null>;
  updateTable: (query: AdminTableRequest.Update) => Promise<AdminTableResponse.Update | null>;

  occupyTable: (query: AdminTableRequest.Occupy) => Promise<AdminTableResponse.Occupy | null>;
  vacateTable: (query: AdminTableRequest.Vacate) => Promise<AdminTableResponse.Vacate | null>;

  clientGetTable: (query: ClientTableRequest.Get) => Promise<ClientTableResponse.Get | null>;

  // 다른 store에서 사용하기 위해 노출. component에서 사용하지 않음.
  _setTables: (tables: AdminTableResponse.Get["result"]) => void;
}

const useTableStore = create<TableState>((set, get) => ({
  clientTable: null,
  tables: [],
  isLoaded: false,
  error: false,

  load: async (query: AdminTableRequest.Get) => await queryStore<AdminTableRequest.Get, AdminTableResponse.Get>({
    route: "admin/table",
    method: "get",
    query,
    setter: set,
    onSuccess: (res) => set({ tables: res.result }),
  }),

  createTable: async (query: AdminTableRequest.Create) => await queryStore<AdminTableRequest.Create, AdminTableResponse.Create>({
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

  removeTable: async (query: AdminTableRequest.Remove) => await queryStore<AdminTableRequest.Remove, AdminTableResponse.Remove>({
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

  updateTable: async (query: AdminTableRequest.Update) => await queryStore<AdminTableRequest.Update, AdminTableResponse.Update>({
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

  occupyTable: async (query: AdminTableRequest.Occupy) => await queryStore<AdminTableRequest.Occupy, AdminTableResponse.Occupy>({
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

  vacateTable: async (query: AdminTableRequest.Vacate) => await queryStore<AdminTableRequest.Vacate, AdminTableResponse.Vacate>({
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

  clientGetTable: async (query: ClientTableRequest.Get) => await queryStore<ClientTableRequest.Get, ClientTableResponse.Get>({
    route: "table",
    method: "get",
    query,
    setter: set,
    onSuccess: (res) => set({ clientTable: res.result }),
  }),

  _setTables: (tables: AdminTableResponse.Get["result"]) => set({ tables }),
}));

export default useTableStore;