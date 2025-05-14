import * as Schema from "db/schema";

export type Create = {
  result: string;
}

export type Get = {
  result: Schema.Order & {
    menuOrders: Schema.MenuOrder[];
    payment: Schema.Payment;
  };
}