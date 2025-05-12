import ky from "ky";
import kyErrorHandler from "~/lib/ky-error-handler";
import { API_BASE_URL } from "shared/constants";

const api = ky.create({
  prefixUrl: API_BASE_URL,
  credentials: "include",
});

export default async function queryStore<
  Query,
  Result,
> ({ route, method, query, setter, onSuccess, onError }: {
  route: string,
  method: "get" | "post" | "put" | "delete" | "patch" | "head",
  query: Query,
  setter?: (state: { loading: boolean, error: boolean }) => void,
  onSuccess?: (res: Result) => void,
  onError?: (error: unknown) => void
}) {
  setter?.({ loading: true, error: false });
  try {
    console.debug(new Date().toLocaleString(), "Query Start:", API_BASE_URL + "/" + route, method, query);
    const res = method === "get" || method === "head" 
      ? await api[method](route).json<Result>() 
      : await api[method](route, { json: query }).json<Result>();
      
    onSuccess?.(res);
    console.debug(new Date().toLocaleString(), "Query Result:", res);
    setter?.({ loading: false, error: false });
  } catch (error) {
    kyErrorHandler(error);
    onError?.(error);
    setter?.({ loading: false, error: true });
  }
}