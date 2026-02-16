import { Link } from "@tanstack/react-router";

import UserMenu from "./user-menu";

import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";




export default function Header() {
  // Dark mode 
  const [isDark, setIsDark] = useState(false);
  function toggleDarkMode() {
    document.documentElement.classList.toggle("dark");
    setIsDark((prev) => !prev);
  }

  // Tabs rendering
  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/messaging", label: "Messaging" },
    // { to: "/todos", label: "Todos" },
    { to: "/ai", label: "AI Chat" },
  ] as const;

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">

        {/* Left : Tabs rendering */}
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} to={to}>
                {label}
              </Link>
            );
          })}
          
        </nav>

        {/* Right : User menu (login/logout/...) */}
        <div className="flex items-center gap-2">
          <UserMenu />
        

          {/* Dark mode toggle */}
          <div>
            <button 
              onClick={toggleDarkMode} 
              className="rounded bg-gray-200 px-2 py-1 text-sm dark:bg-gray-700"
              aria-label="Toggle dark mode"
              >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

      </div>
      <hr />
    </div>
  );
}
