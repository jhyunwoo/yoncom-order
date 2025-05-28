import { useEffect, useState } from "react";
import SignIn from "./components/sign-in";
import { isSignedIn } from "~/lib/auth";
import SignOut from "./components/sign-out";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import SignUp from "./components/sign-up";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "로그인" },
    { name: "description", content: "로그인" }
  ];
};

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
          : signedIn ? <SignOut /> : (
            <Tabs defaultValue="sign-in" className="w-[calc(100% - 1rem)] m-2 flex-1 fc overflow-scroll">
              <TabsList className="w-full justify-normal bg-blue-50 *:w-1/2">
                <TabsTrigger value="sign-in">로그인</TabsTrigger>
                <TabsTrigger value="sign-up">회원가입</TabsTrigger>
              </TabsList>
              <TabsContent value="sign-in" className="full">
                <SignIn />
              </TabsContent>
              <TabsContent value="sign-up">
                <SignUp />
              </TabsContent>
            </Tabs>
          )}
      </div>
    </div>
  );
}