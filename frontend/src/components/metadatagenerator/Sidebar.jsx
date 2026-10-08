import {
  Home,
  History as HistoryIcon,
  CircleHelp,
  Menu,
  X,
} from "lucide-react";

import { NavLink, useLocation } from "react-router-dom";

/* ============================================================
   SIDEBAR
============================================================ */

function Sidebar({ mobileOpen, setMobileOpen }) {
  const { pathname } = useLocation();

  const isHomeActive = pathname === "/";

  /* ==========================================================
     HOME
  ========================================================== */

  const handleHomeClick = () => {
    setMobileOpen?.(false);
    window.location.replace("/");
  };

  /* ==========================================================
     CLOSE MOBILE SIDEBAR
  ========================================================== */

  const handleMobileClose = () => {
    setMobileOpen?.(false);
  };

  return (
    <>
      {/* ======================================================
          MOBILE MENU BUTTON
      ====================================================== */}

      <button
        type="button"
        onClick={() => setMobileOpen?.(true)}
        className="fixed left-1 top-21.5 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0b1f3a] text-white shadow-lg lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      {/* ======================================================
          MOBILE OVERLAY
      ====================================================== */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={handleMobileClose}
        />
      )}

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-full w-[240px] shrink-0
          flex-col bg-gradient-to-br from-[#0b1f3a] via-[#102f52] to-[#163e68]
          text-white shadow-2xl
          transition-transform duration-300 ease-in-out
          lg:static lg:z-auto lg:w-[200px] lg:translate-x-0 lg:shadow-none
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* ====================================================
            MOBILE CLOSE BUTTON
        ==================================================== */}

        <div className="flex items-center justify-between px-4 py-4 lg:hidden">
          <span className="text-sm font-semibold text-blue-100">
            Menu
          </span>

          <button
            type="button"
            onClick={handleMobileClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-blue-100 transition hover:bg-white/10 hover:text-white"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* ====================================================
            NAVIGATION
        ==================================================== */}

        <nav className="mt-5 flex-1 px-3 lg:mt-5">
          {/* ==================================================
              HOME
          ================================================== */}

          <button
            type="button"
            onClick={handleHomeClick}
            className="w-full cursor-pointer border-0 bg-transparent p-0 text-left"
          >
            <SidebarItem
              icon={<Home size={22} />}
              label="Home"
              active={isHomeActive}
            />
          </button>

          {/* ==================================================
              HISTORY
          ================================================== */}

          <NavLink
            to="/history"
            onClick={() => setMobileOpen?.(false)}
          >
            {({ isActive }) => (
              <SidebarItem
                icon={<HistoryIcon size={22} />}
                label="History"
                active={isActive}
              />
            )}
          </NavLink>

          {/* ==================================================
              HELP
          ================================================== */}

          <NavLink
            to="/help"
            onClick={() => setMobileOpen?.(false)}
          >
            {({ isActive }) => (
              <SidebarItem
                icon={<CircleHelp size={22} />}
                label="Help"
                active={isActive}
              />
            )}
          </NavLink>
        </nav>

        {/* ====================================================
            VERSION
        ==================================================== */}

        <div className="px-8 pb-7">
          <p className="text-xs text-blue-200/70">
            GIS Metadata Generator
          </p>

          <p className="mt-1 text-xs text-blue-200/50">
            v1.0
          </p>
        </div>
      </aside>
    </>
  );
}

/* ============================================================
   SIDEBAR ITEM
============================================================ */

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