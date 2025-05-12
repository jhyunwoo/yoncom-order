// app/utils/auth.server.ts
import { redirect } from "@remix-run/node";
import { API_BASE_URL } from "shared/constants";
import queryStore from "~/lib/query";
import * as AuthRequest from "shared/api/types/requests/auth";
import * as AuthResponse from "shared/api/types/responses/auth";
import * as AdminResponse from "shared/api/types/responses/admin";

export async function requireUser(request: Request) {
  const cookie = request.headers.get("cookie");

  const res = await fetch(`${API_BASE_URL}/admin`, {
    headers: {
      cookie: cookie ?? "",
    },
  });

  const data = await res.json();
  return data?.user; // 예: { id: 'abc', email: 'user@domain.com' }
}


export async function isSignedIn(onSuccess: (res: AdminResponse.HeartBeat) => void, onError: (error: unknown) => void) {
  queryStore<{}, AdminResponse.HeartBeat>({
    route: "admin",
    method: "get",
    query: {},
    onSuccess,
    onError,
  })
}

export async function signIn(email: string, password: string) {
  queryStore<AuthRequest.SignInQuery, AuthResponse.SignInResponse>({
    route: "auth/sign-in",
    method: "post",
    query: { email, password },
    onSuccess: () => { window.location.href = "/admin"; },
    onError: () => { window.location.href = "/auth"; },
  })
}

export async function signUp(name: string, email: string, password: string) {
  queryStore<AuthRequest.SignUpQuery, AuthResponse.SignUpResponse>({
    route: "auth/sign-up",
    method: "post",
    query: { name, email, password },
  })
}

export async function signOut() {
  queryStore<{}, AuthResponse.SignOutResponse>({
    route: "auth/sign-out",
    method: "post",
    query: {},
    onSuccess: () => { window.location.href = "/auth"; },
    onError: () => { window.location.href = "/auth"; },
  })
}