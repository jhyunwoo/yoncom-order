import { useEffect, useState } from "react";
import SignIn from "./components/sign-in";
import { isSignedIn } from "~/lib/auth";
import SignOut from "./components/sign-out";

export default function Auth() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    isSignedIn(
      () => setSignedIn(true),
      () => setSignedIn(false)
    );
  }, []);

  return (
    <div className="screen fr items-center justify-center">
      <div className="fit-content max-w-md max-h-md">
        {signedIn === null 
          ? <div>Loading...</div>
          : signedIn ? <SignOut /> : <SignIn />
        }
      </div>
    </div>
  );
}