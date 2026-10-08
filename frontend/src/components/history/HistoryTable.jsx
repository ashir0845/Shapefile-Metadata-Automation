import { useEffect, useState } from "react";

import HistoryEmpty from "./HistoryEmpty";
import HistoryRow from "./HistoryRow";

import { getHistory, downloadHistory, deleteHistory } from "../../services/api";

export default function HistoryTable() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH HISTORY
  // ============================================================

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getHistory();

      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("History fetch error:", err);

      setError("Unable to load history.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD HISTORY ON PAGE LOAD
  // ============================================================

  useEffect(() => {
    fetchHistory();
  }, []);

  // ============================================================
  // DOWNLOAD HISTORY EXCEL
  // ============================================================

  const handleDownload = async (historyId) => {
    try {
      await downloadHistory(historyId);
    } catch (err) {
      console.error("Download error:", err);

      alert("Unable to download the Excel file.");
    }
  };

  // ============================================================
  // DELETE HISTORY
  // ============================================================

  const handleDelete = async (historyId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this generated Excel file from history?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteHistory(historyId);

      setHistory((previousHistory) =>
        previousHistory.filter((item) => item.id !== historyId),
      );
    } catch (err) {
      console.error("Delete history error:", err);

      alert("Unable to delete the history record.");
    }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-gray-200 bg-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-gray-500">Loading history...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-red-200 bg-white">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">
            Unable to Load History
          </h2>

          <p className="mt-2 text-sm text-gray-500">{error}</p>

          <button
            type="button"
            onClick={fetchHistory}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // EMPTY STATE
  // ============================================================

  if (history.length === 0) {
    return <HistoryEmpty />;
  }

  // ============================================================
  // HISTORY TABLE
  // ============================================================

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead className="bg-gradient-to-br from-[#0b1f3a] via-[#102f52] to-[#163e68]">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                #
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                File Name
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Entity
              </th>

              <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-semibold text-white">
                Data Published
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Created At
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Records
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Attributes
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Status
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {history.map((item, index) => (
              <HistoryRow
                key={item.id}
                item={item}
                index={index}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
