import * as Schema from "db/schema";

export type Get = {
  result: Schema.Table & {
    tableContexts: (Schema.TableContext & {
      orders: (Schema.Order & {
        menuOrders: Schema.MenuOrder[];
        payment: Schema.Payment;
      })[];
    })[];
  };
};
