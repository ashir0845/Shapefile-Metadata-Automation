import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";

function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fb]">

      {/* SIDEBAR */}
      <Sidebar />

      {/* RIGHT SIDE */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* HEADER */}
        <Header />

        {/* PAGE CONTENT */}
        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default Layout;