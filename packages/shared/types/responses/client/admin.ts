import { User } from "lucia";

export type HeartBeat = {
  result: string;
  user: User | null;
}