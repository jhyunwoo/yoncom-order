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
    const interval = setInterval(async () => {
      await useMenuStore.getState().adminLoad({});
      await useTableStore.getState().load({});
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return <Outlet />;
}
