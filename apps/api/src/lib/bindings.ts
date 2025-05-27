import { Session, User } from "lucia";

export type Bindings = {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
};

export type Variables = {
  user: User | null;
  session: Session | null;
};
