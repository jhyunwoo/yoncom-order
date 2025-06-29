// app/utils/auth.server.ts
import { redirect } from "@remix-run/node";
import { API_BASE_URL } from "shared/constants";
import queryStore from "~/lib/query";
import * as AuthRequest from "shared/types/requests/client/auth";
import * as AuthResponse from "shared/types/responses/client/auth";
import * as AdminResponse from "shared/types/responses/client/admin";

export async function requireUser(request: Request) {
  const cookie = request.headers.get("cookie");

  const res = await fetch(`${API_BASE_URL}/admin`, {
    headers: {
      cookie: cookie ?? "",
    },
    credentials: "include",
  });

  const data = await res.json();
  return data?.user; // 예: { id: 'abc', email: 'user@domain.com' }
}

export async function isSignedIn(
  onSuccess: (res: AdminResponse.HeartBeat) => void,
  onError: (error: unknown) => void,
) {
  queryStore<{}, AdminResponse.HeartBeat>({
    route: "admin",
    method: "get",
    query: {},
    onSuccess,
    onError,
  });
}

export async function signIn(email: string, password: string) {
  queryStore<AuthRequest.SignIn, AuthResponse.SignIn>({
    route: "auth/sign-in",
    method: "post",
    query: { email, password },
    onSuccess: () => {
      window.location.href = "/admin/pos";
    },
    onError: () => {
      window.location.href = "/auth";
    },
  });
}

export async function signUp(name: string, email: string, password: string) {
  queryStore<AuthRequest.SignUp, AuthResponse.SignUp>({
    route: "auth/sign-up",
    method: "post",
    query: { name, email, password },
    onSuccess: () => {
      window.location.href = "/auth";
    },
  });
}

export async function signOut() {
  queryStore<{}, AuthResponse.SignOut>({
    route: "auth/sign-out",
    method: "post",
    query: {},
    onSuccess: () => {
      window.location.href = "/auth";
    },
    onError: () => {
      window.location.href = "/auth";
    },
  });
}
