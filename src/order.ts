import { Hono } from "hono";
import { Bindings, Variables } from "./lib/bindings";

const order = new Hono<{ Bindings: Bindings; Variables: Variables }>();

export default order;
