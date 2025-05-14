export default function ShopIntro({ tableName, tableSeats }: { tableName: string, tableSeats: number }) {
  return (
    <div className="mb-0 fr justify-between items-center py-4 bg-none max-w-[600px]">
      <div className="h-full fit-content fr">
        <hr className="h-full border-slate-300 border-l-4 mr-4" />
        <div className="fc justify-center">
          <h1 className="font-extrabold text-2xl flex items-center">{tableName}</h1>
          <span className="text-sm">{tableSeats}인석</span>
        </div>
      </div>
      <img src={"/" + "favicon.ico"} alt="" width={100} height={100} className="p-2 rounded-2xl" />
    </div>
  );
}