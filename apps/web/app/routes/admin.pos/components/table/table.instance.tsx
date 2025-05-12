import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import * as TableResponse from "shared/api/types/responses/table";
import TableSetModal from "./table.set.modal";
import * as Schema from "db/schema";
import useTableStore from "~/stores/table.store";
import { dateDiffString } from "~/lib/date";
// import { diffString } from "~/utils/date";

export default function TableInstance({
  table
}: { 
  table: TableResponse.AdminGet["result"][0]
}) {
  const activeTableContext = table.tableContexts.find((tableContext) => tableContext.deletedAt === null);
  const inUse = activeTableContext !== undefined;
  const [modalOpen, setModalOpen] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <Card className={
        `rounded-2xl aspect-square active:brightness-95 hover:cursor-pointer 
        ${inUse
            ? "bg-[#D9D9D9]"
            : "bg-white drop-shadow-lg"
        }`
      } style={{
        boxShadow: inUse ? "inset 2px 2px 8px rgba(0,0,0,0.2)" : "none",
      }} onClick={() => setModalOpen(true)}>

        { /* CardHeader: 테이블이 미사용 중일때 표시 */}
        <CardHeader className={`${inUse ? `hidden` : `justify-center items-center full p-0`}`}>
          <CardTitle className="font-extrabold text-xl">{table.name}</CardTitle>
          <CardDescription className="text-sm text-neutral-500 !m-0">
            {table.seats}인석
          </CardDescription>
        </CardHeader>

        { /* CardContent: 테이블이 사용 중일때 표시 */
          inUse && (
            <CardContent className={`${!inUse ? `hidden` : `full p-0`}`}>
              <span className="block pl-3 pt-1 text-lg font-bold">{table.name}</span>
            <span className="block pl-3 -mt-1 text-sm font-normal text-neutral-500">{
              dateDiffString(now, activeTableContext.createdAt).startsWith("-")
                ? "00:00"
                : dateDiffString(now, activeTableContext.createdAt)
            }
            </span>
          </CardContent>
        )}
      </Card>
      <TableSetModal
        table={table}
        openState={modalOpen}
        setOpenState={setModalOpen}
      />
    </>
  )
}