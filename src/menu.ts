import { Hono } from "hono";
import { Bindings, Variables } from "./lib/bindings";

const menu = new Hono<{ Bindings: Bindings; Variables: Variables }>();

export default menu;
