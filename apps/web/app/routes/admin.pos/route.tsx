import Tables from "./components/table/tables";
import Orders from "./components/order/orders";
import Inventories from "./components/inventory/inventories";

export default function POS() { 
  return (
    <div className="w-screen h-screen flex bg-white p-2">
      <div className="w-1/4 h-full">
        <Orders></Orders>
      </div>
      <div className="w-1/2 h-full fc items-center justify-center">
        <Tables></Tables>
      </div>
      <div className="w-1/4 h-full flex items-center justify-center">
        <Inventories></Inventories>
      </div>
    </div>
  )
}