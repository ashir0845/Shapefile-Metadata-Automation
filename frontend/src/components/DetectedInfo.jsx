import {
  Database,
  FileArchive,
  ListTree,
  ShieldCheck,
} from "lucide-react";

function DetectedInfo({ metadata }) {
  if (!metadata) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
          <Database
            size={19}
            className="text-blue-600"
          />
        </div>

        <h2 className="text-sm font-bold text-[#102b55]">
          Detected Shapefile Information
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoItem
          icon={<FileArchive size={17} />}
          label="File Name"
          value={metadata.filename}
        />

        <InfoItem
          icon={<ListTree size={17} />}
          label="Attributes"
          value={metadata.total_fields}
        />

        <InfoItem
          icon={<Database size={17} />}
          label="Records"
          value={metadata.total_records?.toLocaleString()}
        />

        <InfoItem
          icon={<ShieldCheck size={17} />}
          label="Status"
          value="Valid"
          status
        />
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  status = false,
}) {
  return (
    <div className="flex items-center gap-3 border-r border-slate-100 last:border-0">
      <div className="text-blue-600">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] text-slate-400">
          {label}
        </p>

        {status ? (
          <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
            {value}
          </span>
        ) : (
          <p className="mt-1 truncate text-sm font-semibold text-slate-800">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

export default DetectedInfo;