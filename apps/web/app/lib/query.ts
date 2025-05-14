import ky, { SearchParamsOption } from "ky";
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
  setter?: (state: { isLoaded: boolean, error: boolean }) => void,
  onSuccess?: (res: Result) => void,
  onError?: (error: unknown) => void
}): Promise<Result | null> {
  setter?.({ isLoaded: false, error: false });
  try {
    console.debug(new Date().toLocaleString(), "Query Start:", API_BASE_URL + "/" + route, method, query);
    const res = method === "get" || method === "head" 
      ? await api[method](route, { searchParams: query as SearchParamsOption }).json<Result>() 
      : await api[method](route, { json: query }).json<Result>();
      
    onSuccess?.(res);
    console.debug(new Date().toLocaleString(), "Query Result:", res);
    setter?.({ isLoaded: true, error: false });
    return res;
  } catch (error) {
    kyErrorHandler(error);
    onError?.(error);
    setter?.({ isLoaded: false, error: true });
    return null;
  }
}