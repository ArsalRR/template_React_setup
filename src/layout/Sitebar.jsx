import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/lib/nav";

const APP_LOGO = "/logo.png";
const APP_NAME = "Nama Aplikasi";
const APP_TAGLINE = "Testing";

const ROW =
  "flex w-full items-center justify-between gap-3 rounded-lg px-3 text-left text-sm transition-colors duration-150";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50";
const IDLE =
  "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100";
const ACTIVE = "bg-rose-700 font-medium text-white";
const ACTIVE_SOFT =
  "bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-100";

const isInside = (pathname, to) => pathname === to || pathname.startsWith(to + "/");
const isExact = (pathname, to) => pathname === to || pathname === to + "/";

function Chevron({ open }) {
  return (
    <ChevronRight
      aria-hidden="true"
      className={cn(
        "h-4 w-4 shrink-0 opacity-60 transition-transform duration-200",
        open && "rotate-90"
      )}
    />
  );
}

function NavItem({ item, depth = 0, closeMobile }) {
  const { pathname } = useLocation();
  const hasChildren = item.children.length > 0;
  const inside = isInside(pathname, item.to);
  const exact = isExact(pathname, item.to);
  const [open, setOpen] = useState(inside || item.defaultOpen);
  const pad = depth === 0 ? "py-2" : "py-1.5";

  useEffect(() => {
    if (inside) setOpen(true);
  }, [inside]);

  // 1) Menu biasa tanpa anak
  if (!hasChildren) {
    return (
      <NavLink
        to={item.to}
        onClick={closeMobile}
        className={({ isActive }) => cn(ROW, FOCUS, pad, isActive ? ACTIVE : IDLE)}
      >
        <span className="truncate">{item.label}</span>
      </NavLink>
    );
  }

  // 2) Induk dengan submenu: seluruh baris bisa diklik
  const rowState = item.toggleOnly
    ? inside
      ? ACTIVE_SOFT
      : IDLE
    : exact
      ? ACTIVE
      : inside
        ? ACTIVE_SOFT
        : IDLE;

  const content = (
    <>
      <span className="truncate">{item.label}</span>
      <Chevron open={open} />
    </>
  );

  return (
    <div>
      {item.toggleOnly ? (
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={cn(ROW, FOCUS, pad, rowState)}
        >
          {content}
        </button>
      ) : (
        <NavLink
          to={item.to}
          end
          aria-expanded={open}
          onClick={() => (exact ? setOpen((o) => !o) : setOpen(true))}
          className={cn(ROW, FOCUS, pad, rowState)}
        >
          {content}
        </NavLink>
      )}

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden" inert={!open}>
          <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-slate-200 pl-2 dark:border-slate-700">
            {item.children.map((child) => (
              <NavItem
                key={child.to}
                item={child}
                depth={depth + 1}
                closeMobile={closeMobile}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
          FOCUS,
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
          "flex h-screen w-64 shrink-0 flex-col border-r transition-transform duration-300",
          "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
          "fixed inset-y-0 left-0 z-40",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:static md:z-auto md:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-700">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={APP_LOGO}
              alt={`Logo ${APP_NAME}`}
              className="h-9 w-9 shrink-0 object-contain"
            />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {APP_NAME}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {APP_TAGLINE}
              </p>
            </div>
          </div>
          <button
            onClick={closeMobile}
            className={cn(
              "rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 md:hidden",
              "dark:hover:bg-slate-800 dark:hover:text-slate-300",
              FOCUS
            )}
            aria-label="Tutup menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex flex-1 flex-col overflow-y-auto px-3 pb-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="pb-1.5 pl-3 pt-5 text-xs font-medium text-slate-400 dark:text-slate-500">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <NavItem key={item.to} item={item} closeMobile={closeMobile} />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}