import {
  File,
  FileCode,
  FileText,
  Map,
  ShieldCheck,
} from "lucide-react";

function RequiredFiles() {
  const files = [
    {
      extension: ".shp",
      label: "Shape geometry data",
      required: true,
      icon: File,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      extension: ".shx",
      label: "Shape index file",
      required: true,
      icon: FileCode,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      extension: ".dbf",
      label: "Attribute table file",
      required: true,
      icon: FileText,
      bg: "bg-orange-50",
      text: "text-orange-500",
    },
    {
      extension: ".prj",
      label: "Projection information",
      required: false,
      icon: Map,
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* HEADER */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50">
          <ShieldCheck
            size={23}
            className="text-emerald-600"
          />
        </div>

        <h2 className="font-bold text-[#145e57]">
          Required Shapefile Files
        </h2>
      </div>

      <p className="mb-5 text-sm text-slate-600">
        Your ZIP file must contain the following files:
      </p>

      <div className="space-y-4">
        {files.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.extension}
              className="flex items-center gap-4"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bg}`}
              >
                <Icon
                  size={21}
                  className={item.text}
                />
              </div>

              <div>
                <p className="font-bold text-slate-800">
                  {item.extension}
                </p>

                <p className="text-xs text-slate-500">
                  {item.required
                    ? "(Required)"
                    : "(Recommended)"}
                </p>
              </div>

              <p className="ml-auto text-right text-xs text-slate-500">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RequiredFiles;