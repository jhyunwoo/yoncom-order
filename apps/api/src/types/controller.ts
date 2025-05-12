import { ContentfulStatusCode } from "hono/utils/http-status";

type ControllerSuccess<T extends { result: unknown }> = {
  result: T["result"];
  error?: never;
  status: 200;
}

type ControllerFailure = {
  result?: never;
  error: string;
  status: ContentfulStatusCode;
}

type ControllerResult<T extends { result: unknown }> = ControllerSuccess<T> | ControllerFailure;
export default ControllerResult;