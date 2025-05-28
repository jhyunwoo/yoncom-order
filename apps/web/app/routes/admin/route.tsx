// app/routes/admin.tsx
import { Outlet, redirect } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { isSignedIn, requireUser } from "~/lib/auth";
import { useEffect } from "react";

import useMenuStore from "~/stores/menu.store";
import useTableStore from "~/stores/table.store";

// export const loader: LoaderFunction = async ({ request }) => {
//   const user = await requireUser(request); // API 통해 인증
//   if (!user) throw redirect("/auth");
  
//   return user;
// };

export default function AdminLayout() {
  useEffect(() => {
    isSignedIn((res) => {
      if (res.user === null) {
        window.location.href = "/auth";
      }
    }, (error) => {
      console.error(error);
      window.location.href = "/auth";
    });

    const interval = setInterval(async () => {
      await useMenuStore.getState().adminLoad({});
      await useTableStore.getState().load({});
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <Outlet />;
}