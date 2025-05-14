import * as Schema from "db/schema";

export type Create = {
  result: string;
};

export type Remove = {
  result: string;
};

export type Vacate = {
  result: string;
};

export type Occupy = {
  result: string;
};

export type Update = {
  result: string;
};

export type ClientGet = {
  result: Schema.Table & {
    tableContexts: (Schema.TableContext & {
      orders: (Schema.Order & {
        menuOrders: Schema.MenuOrder[];
        payment: Schema.Payment;
      })[];
    })[];
  };
};

export type AdminGet = {
  result: (Schema.Table & {
    tableContexts: (Schema.TableContext & {
      orders: (Schema.Order & {
        menuOrders: Schema.MenuOrder[];
        payment: Schema.Payment;
      })[];
    })[];
  })[];
};
