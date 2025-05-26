import { HTTPError } from "ky";
import * as ClientErrorResponse from "types/responses/client/error";
import { toast } from "~/hooks/use-toast";

export default async function kyErrorHandler(error: unknown) {
  if (error instanceof HTTPError) {
    const res = await error.response.json<ClientErrorResponse.Error>();
    console.error(new Date().toLocaleString(), "HTTP Error:", res.error);
    toast({
      variant: "destructive",
      title: "오류가 발생했습니다.",
      description: res.error,
      duration: 3000,
    });
  } else {
    console.error(new Date().toLocaleString(), "Fetch Error:", error);
    toast({
      variant: "destructive",
      title: "오류가 발생했습니다.",
      description: "네트워크 오류가 발생했습니다. 다시 시도해주세요.",
      duration: 3000,
    });
  }
}
