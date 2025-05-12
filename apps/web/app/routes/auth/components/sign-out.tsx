import { Button } from "~/components/ui/button";
import { signOut } from "~/lib/auth";
import { useNavigate } from "@remix-run/react";

export default function SignOut() {

  const handleConfirm = async () => {
    await signOut();
    document.location.href = "/auth";
  }

  return (
    <Button onClick={handleConfirm}>Sign Out</Button>
  );
}