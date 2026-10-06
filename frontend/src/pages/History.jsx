import HistoryHeader from "../components/history/HistoryHeader";
import HistoryTable from "../components/history/HistoryTable";


export default function History() {
  return (
    <div className="min-h-full bg-[#f4f7fa] p-4 sm:p-6 lg:p-8">
      <HistoryHeader />
      <HistoryTable />
    </div>
  );
}
