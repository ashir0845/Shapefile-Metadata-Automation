import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/logo.png";

function Header() {
  const navigate = useNavigate();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef(null);

  const username =
    sessionStorage.getItem("username") || "User";

  const role =
    sessionStorage.getItem("role") || "User";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("role");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header className="flex h-[84px] flex-row items-center justify-between border-slate-200 bg-gradient-to-br from-[#0b1f3a] via-[#102f52] to-[#163e68] px-5 sm:px-8">

      {/* LEFT */}
      <div className="flex min-w-0 items-center gap-3">
        <img
          src={logo}
          alt="GIS Metadata Generator"
          className="h-15 w-auto object-contain"
        />

        <div className="min-w-0">
          <h1 className="ml-2 truncate text-lg font-bold text-white sm:ml-5 sm:text-4xl">
            Shapefile Metadata Automation
          </h1>
        </div>
      </div>

      {/* RIGHT - USER */}
      <div
        ref={userMenuRef}
        className="relative shrink-0"
      >
        {/* USER ICON BUTTON */}
        <button
          type="button"
          onClick={() =>
            setIsUserMenuOpen(
              (previous) => !previous,
            )
          }
          aria-label="Open user menu"
          aria-expanded={isUserMenuOpen}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
            />
          </svg>
        </button>

        {/* DROPDOWN */}
        {isUserMenuOpen && (
          <div className="absolute right-0 top-14 z-50 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">

            {/* USER INFO */}
            <div className="border-b border-gray-200 px-4 py-3">
              <p className="truncate text-sm font-semibold text-[#0b1f3a]">
                {username}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {role}
              </p>
            </div>

            {/* LOGOUT */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 12H9m0 0 3-3m-3 3 3 3"
                />
              </svg>

              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;