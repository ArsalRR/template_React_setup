import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sun, Moon, Menu, X, Home } from "lucide-react";
import { cn } from "@/lib/utils";
const NAV_GROUPS = [
  {
    label: "Dashboard",
    items: [{ label: "Beranda", to: "/dashboard", icon: Home }],
  },
];

export function Sidebar({ collapsed, onToggle }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handleChange = (e) => {
      if (e.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className={cn(
          "fixed left-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-lg border md:hidden",
          "border-slate-200 bg-white text-slate-600",
          "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
          mobileOpen && "hidden"
        )}
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "flex h-screen flex-col border-r transition-transform duration-300",
          "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
          "fixed inset-y-0 left-0 z-40 w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:static md:z-auto md:translate-x-0 md:transition-all",
          collapsed ? "md:w-16" : "md:w-58"
        )}
      >
        {/* Brand */}
        <div
          className={cn(
            "flex items-center border-b px-3 py-4",
            "border-slate-200 dark:border-slate-700",
            collapsed ? "md:justify-center" : "justify-between gap-3"
          )}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-700 text-sm font-semibold text-white">
            
            </div>
            {(!collapsed || mobileOpen) && (
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              </p>
            )}
          </div>

          <button
            onClick={closeMobile}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 md:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-4 w-4" />
          </button>

          {!collapsed && (
            <button
              onClick={onToggle}
              className="hidden rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 md:block"
              aria-label="Tutup sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="hidden justify-center py-2 md:flex">
            <button
              onClick={onToggle}
              className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              aria-label="Buka sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Menu */}
        <nav className="flex flex-1 flex-col overflow-y-auto px-2 py-2">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-1">
              {(!collapsed || mobileOpen) && (
                <p className="mb-1 mt-3 px-3 text-[10px] font-medium uppercase tracking-wider text-slate-400 first:mt-1 dark:text-slate-500">
                  {group.label}
                </p>
              )}
              {collapsed && !mobileOpen && (
                <div className="mx-2 my-1 hidden border-t border-slate-100 dark:border-slate-700 md:block" />
              )}

              <div className="flex flex-col gap-0.5">
                {group.items.map(({ label, to, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={closeMobile}
                    title={collapsed && !mobileOpen ? label : undefined}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center rounded-lg py-2 text-sm transition-colors",
                        collapsed && !mobileOpen ? "md:justify-center md:px-2" : "gap-3 px-3",
                        isActive
                          ? "bg-rose-700 font-medium text-white"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      )
                    }
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    {(!collapsed || mobileOpen) && <span>{label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: toggle tema */}
        <div className="border-t border-slate-200 px-2 py-3 dark:border-slate-700">
          <button
            onClick={() => setDark((d) => !d)}
            title={collapsed && !mobileOpen ? (dark ? "Mode terang" : "Mode gelap") : undefined}
            className={cn(
              "flex w-full items-center rounded-lg py-2 text-sm transition",
              "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
              "dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
              collapsed && !mobileOpen ? "md:justify-center md:px-2" : "gap-3 px-3"
            )}
          >
            {dark ? (
              <Sun className="h-[18px] w-[18px] shrink-0" />
            ) : (
              <Moon className="h-[18px] w-[18px] shrink-0" />
            )}
            {(!collapsed || mobileOpen) && <span>{dark ? "Mode Terang" : "Mode Gelap"}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}