import {
  Bell,
  ChevronDown,
  UserCircle,
} from "lucide-react";

function Header() {
  return (
    <header className="flex h-[84px] items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
          <div className="text-2xl">🌐</div>
        </div>

        <div>
          <h1 className="text-lg font-bold text-[#102b55] sm:text-xl">
            Generate GIS Metadata
          </h1>

          <p className="text-xs text-slate-500 sm:text-sm">
            Upload your complete Shapefile (ZIP) and get detailed metadata in an Excel file.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      {/* <div className="flex items-center gap-4">
        <button
          type="button"
          className="hidden text-slate-500 transition hover:text-blue-600 sm:block"
        >
          <Bell size={21} />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <UserCircle size={27} />
          </div>

          <span className="hidden text-sm font-semibold text-slate-700 sm:block">
            User
          </span>

          <ChevronDown
            size={16}
            className="text-slate-500"
          />
        </div>
      </div> */}
    </header>
  );
}

export default Header;