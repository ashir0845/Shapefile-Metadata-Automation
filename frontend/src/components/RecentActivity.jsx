import {
  Clock3,
  Download,
  Eye,
  FileSpreadsheet,
} from "lucide-react";

function RecentActivity({ metadata }) {
  if (!metadata) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <Clock3
            size={18}
            className="text-slate-600"
          />

          <h2 className="text-sm font-bold text-[#102b55]">
            Recent Activity
          </h2>
        </div>

        <button
          type="button"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          View All
        </button>
      </div>

      {/* MOBILE */}
      <div className="block p-4 sm:hidden">
        <div className="rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
              <FileSpreadsheet
                size={18}
                className="text-purple-600"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                {metadata.filename}
              </p>

              <p className="text-xs text-slate-400">
                {metadata.total_records?.toLocaleString()} records
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
              Success
            </span>

            <div className="flex gap-3">
              <button className="text-blue-600">
                <Download size={17} />
              </button>

              <button className="text-blue-600">
                <Eye size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                File Name
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                Records
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                Attributes
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                Generated On
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                Status
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b border-slate-100 last:border-0">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
                    <FileSpreadsheet
                      size={16}
                      className="text-purple-600"
                    />
                  </div>

                  <span className="text-sm font-semibold text-slate-700">
                    {metadata.filename}
                  </span>
                </div>
              </td>

              <td className="px-5 py-4 text-sm text-slate-600">
                {metadata.total_records?.toLocaleString()}
              </td>

              <td className="px-5 py-4 text-sm text-slate-600">
                {metadata.total_fields}
              </td>

              <td className="px-5 py-4 text-sm text-slate-500">
                {new Date().toLocaleDateString("en-IN")}
              </td>

              <td className="px-5 py-4">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                  Success
                </span>
              </td>

              <td className="px-5 py-4">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                    <Download size={15} />
                    Download
                  </button>

                  <button className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                    <Eye size={15} />
                    View
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default RecentActivity;