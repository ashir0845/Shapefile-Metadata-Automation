import { Download, Trash2 } from "lucide-react";

export default function HistoryRow({ item, index, onDownload, onDelete }) {
  const formatDateTime = (dateString) => {
    if (!dateString) {
      return {
        date: "-",
        time: "",
      };
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return {
        date: "-",
        time: "",
      };
    }

    const datePart = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);

    const timePart = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date);

    return {
      date: datePart,
      time: timePart,
    };
  };

  const formatted = formatDateTime(item.created_at);

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50">
      {/* Serial Number */}
      <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>

      {/* File Name */}
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        {item.filename || "-"}
      </td>

      {/* Entity */}
      <td className="px-6 py-4 text-sm text-gray-600">{item.entity || "-"}</td>

      {/* Year / Publication Date */}
      <td className="px-6 py-4 text-sm text-gray-600">
        {item.publication_date || "-"}
      </td>

      {/* Created At */}
      <td className="px-6 py-4 text-sm text-gray-600">
        <div>
          <div>{formatted.date}</div>
          {/* <div>{formatted.time}</div> */}
        </div>
      </td>

      {/* Records */}
      <td className="px-6 py-4 text-sm text-gray-600">
        {item.records_count ?? 0}
      </td>

      {/* Attributes */}
      <td className="px-6 py-4 text-sm text-gray-600">
        {item.attributes_count ?? 0}
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          {item.status || "success"}
        </span>
      </td>

      {/* Actions */}
      {/* Actions */}
      <td className="whitespace-nowrap px-4 py-4">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onDownload(item.id)}
            className="flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs font-semibold text-[#285596] transition hover:bg-blue-50"
          >
            <Download size={12} />
            Download
          </button>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
