import { useEffect, useState } from "react";
import HistoryEmpty from "./HistoryEmpty";
import HistoryRow from "./HistoryRow";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function HistoryTable() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/history`);

      if (!response.ok) {
        throw new Error(`Failed to fetch history. Status: ${response.status}`);
      }

      const data = await response.json();

      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("History fetch error:", err);
      setError("Unable to load history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDownload = async (historyId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/history/${historyId}/download`,
      );

      if (!response.ok) {
        throw new Error("Failed to download file.");
      }

      const blob = await response.blob();

      const contentDisposition = response.headers.get("content-disposition");

      let filename = "metadata.xlsx";

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/i);

        if (match?.[1]) {
          filename = match[1];
        }
      }

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Unable to download the Excel file.");
    }
  };

  const handleDelete = async (historyId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this generated Excel file from history?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/history/${historyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete history.");
      }

      setHistory((previousHistory) =>
        previousHistory.filter((item) => item.id !== historyId),
      );
    } catch (err) {
      console.error("Delete history error:", err);
      alert("Unable to delete the history record.");
    }
  };

  // Loading state
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

  // Error state
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

  // Empty state
  if (history.length === 0) {
    return <HistoryEmpty />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                #
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                File Name
              </th>

              {/* NEW */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Entity
              </th>

              {/* NEW */}
              <th className="whitespace-nowrap px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Data Published
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Created At
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Records
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Attributes
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Status
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
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
