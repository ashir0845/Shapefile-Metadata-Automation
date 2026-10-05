import {
  Home,
  History as HistoryIcon,
  CircleHelp,
  Layers3,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="hidden w-[200px] shrink-0 flex-col bg-[#0b1f3a] text-white lg:flex">

      {/* LOGO */}
      <div className="flex h-[88px] items-center gap-3 px-7">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
          <Layers3
            size={30}
            className="text-blue-400"
          />
        </div>

        <div>
          <h1 className="text-[12px] font-semibold leading-tight">
            GIS Metadata
          </h1>

          <p className="text-[12px] font-semibold leading-tight">
            Generator
          </p>
        </div>

      </div>

      {/* NAVIGATION */}
      <nav className="mt-5 flex-1 px-3">

        {/* HOME */}
        <NavLink to="/" end>
          {({ isActive }) => (
            <SidebarItem
              icon={<Home size={22} />}
              label="Home"
              active={isActive}
            />
          )}
        </NavLink>

        {/* HISTORY */}
        <NavLink to="/history">
          {({ isActive }) => (
            <SidebarItem
              icon={<HistoryIcon size={22} />}
              label="History"
              active={isActive}
            />
          )}
        </NavLink>

        {/* HELP */}
        <NavLink to="/help">
          {({ isActive }) => (
            <SidebarItem
              icon={<CircleHelp size={22} />}
              label="Help"
              active={isActive}
            />
          )}
        </NavLink>

      </nav>

      {/* VERSION */}
      <div className="px-8 pb-7">

        <p className="text-xs text-blue-200/70">
          GIS Metadata Generator
        </p>

        <p className="mt-1 text-xs text-blue-200/50">
          v1.0
        </p>

      </div>

    </aside>
  );
}


function SidebarItem({
  icon,
  label,
  active = false,
}) {
  return (
    <div
      className={`mb-2 flex w-full items-center gap-4 rounded-xl px-5 py-4 text-left text-sm font-semibold transition ${
        active
          ? "bg-[#285596] text-white shadow-lg"
          : "text-blue-100/80 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}

      <span>{label}</span>
    </div>
  );
}

export default Sidebar;