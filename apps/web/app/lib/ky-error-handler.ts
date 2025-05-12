import { HTTPError } from "ky";
import ErrorResponse from "shared/api/types/responses/error";

export default async function kyErrorHandler(error: unknown) {
  if (error instanceof HTTPError) {
    const res = await error.response.json<ErrorResponse>();
    console.error(new Date().toLocaleString(), "HTTP Error:", res.error);
  } else {
    console.error(new Date().toLocaleString(), "Fetch Error:", error);
  }
}
