import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f4f7fb]">
      {/* ======================================================
          FULL WIDTH HEADER
      ====================================================== */}

      <div className="shrink-0">
        <Header />
      </div>

      {/* ======================================================
          SIDEBAR + CONTENT
      ====================================================== */}

      <div className="flex min-h-0 flex-1">
        {/* SIDEBAR */}
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        {/* PAGE CONTENT */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
