import { Session, User } from "lucia";

export type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  CLOUDFLARE_ACCOUNT_ID: string;
  R2_ACCESS_KEY: string;
  R2_SECRET_ACCESS_KEY: string;
};

export type Variables = {
  user: User | null;
  session: Session | null;
  customerToken: string | null;
};
