import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sun, Moon, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/lib/nav";

const ROW = "flex items-center rounded-lg text-sm transition-colors";
const IDLE =
  "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200";
const ACTIVE = "bg-rose-700 font-medium text-white";
const ACTIVE_SOFT = "bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-100";

const isInside = (pathname, to) => pathname === to || pathname.startsWith(to + "/");
const isExact = (pathname, to) => pathname === to || pathname === to + "/";

function Letter({ label }) {
  return (
    <span className="flex h-[18px] w-[18px] items-center justify-center text-xs font-semibold uppercase">
      {label.charAt(0)}
    </span>
  );
}

/* Panel kecil di sebelah kanan sidebar saat sidebar diciutkan */
function Flyout({ item, position, anchorRef, onClose }) {
  const { pathname } = useLocation();
  const panelRef = useRef(null);

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const onDown = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      if (anchorRef.current?.contains(e.target)) return;
      onClose();
    };
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [anchorRef, onClose]);

  const renderList = (children, depth) =>
    children.map((child) => (
      <div key={child.to}>
        <NavLink
          to={child.to}
          end={child.children.length > 0}
          className={({ isActive }) =>
            cn(ROW, "gap-3 px-3 py-1.5", isActive ? ACTIVE : IDLE)
          }
          style={{ marginLeft: depth * 12 }}
        >
          <span className="truncate">{child.label}</span>
        </NavLink>
        {child.children.length > 0 && renderList(child.children, depth + 1)}
      </div>
    ));

  return createPortal(
    <div
      ref={panelRef}
      style={{
        top: position.top,
        left: position.left,
        maxHeight: `calc(100vh - ${position.top}px - 16px)`,
      }}
      className="fixed z-50 w-52 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-md dark:border-slate-700 dark:bg-slate-900"
    >
      {item.toggleOnly ? (
        <p className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {item.label}
        </p>
      ) : (
        <NavLink
          to={item.to}
          end
          className={({ isActive }) =>
            cn(ROW, "gap-3 px-3 py-1.5", isActive ? ACTIVE : IDLE)
          }
        >
          <span className="truncate">{item.label}</span>
        </NavLink>
      )}
      <div className="mt-0.5 flex flex-col gap-0.5">{renderList(item.children, 0)}</div>
    </div>,
    document.body
  );
}

function NavItem({ item, depth = 0, iconOnly, closeMobile }) {
  const { pathname } = useLocation();
  const hasChildren = item.children.length > 0;
  const inside = isInside(pathname, item.to);
  const exact = isExact(pathname, item.to);
  const [open, setOpen] = useState(inside || item.defaultOpen);
  const [flyout, setFlyout] = useState(null);
  const btnRef = useRef(null);
  const pad = depth === 0 ? "py-2" : "py-1.5";

  useEffect(() => {
    if (inside) setOpen(true);
  }, [inside]);

  useEffect(() => {
    if (!iconOnly) setFlyout(null);
  }, [iconOnly]);

  // 1) Menu biasa tanpa anak
  if (!hasChildren) {
    return (
      <NavLink
        to={item.to}
        onClick={closeMobile}
        title={iconOnly ? item.label : undefined}
        className={({ isActive }) =>
          cn(
            ROW,
            pad,
            iconOnly ? "md:justify-center md:px-2" : "gap-3 px-3",
            isActive ? ACTIVE : IDLE
          )
        }
      >
        {iconOnly ? <Letter label={item.label} /> : <span className="truncate">{item.label}</span>}
      </NavLink>
    );
  }

  // 2) Sidebar diciutkan: induk membuka panel di samping
  if (iconOnly) {
    const toggleFlyout = () => {
      if (flyout) return setFlyout(null);
      const rect = btnRef.current.getBoundingClientRect();
      setFlyout({ top: rect.top, left: rect.right + 8 });
    };
    return (
      <>
        <button
          ref={btnRef}
          onClick={toggleFlyout}
          title={item.label}
          aria-haspopup="true"
          aria-expanded={!!flyout}
          className={cn(ROW, pad, "w-full md:justify-center md:px-2", inside ? ACTIVE : IDLE)}
        >
          <Letter label={item.label} />
        </button>
        {flyout && (
          <Flyout
            item={item}
            position={flyout}
            anchorRef={btnRef}
            onClose={() => setFlyout(null)}
          />
        )}
      </>
    );
  }

  // 3) Sidebar terbuka: induk dengan submenu (teks + panah satu baris)
  const chevron = (
    <ChevronRight
      className={cn(
        "h-4 w-4 shrink-0 opacity-60 transition-transform duration-200",
        open && "rotate-90"
      )}
    />
  );

  const rowState = item.toggleOnly
    ? inside
      ? ACTIVE_SOFT
      : IDLE
    : exact
      ? ACTIVE
      : inside
        ? ACTIVE_SOFT
        : IDLE;

  return (
    <div>
      {item.toggleOnly ? (
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={cn(ROW, pad, "w-full justify-between gap-3 px-3", rowState)}
        >
          <span className="truncate">{item.label}</span>
          {chevron}
        </button>
      ) : (
        <div className={cn(ROW, rowState)}>
          <NavLink
            to={item.to}
            end
            onClick={() => setOpen(true)}
            className={cn("flex-1 truncate px-3", pad)}
          >
            {item.label}
          </NavLink>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? `Tutup submenu ${item.label}` : `Buka submenu ${item.label}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          >
            {chevron}
          </button>
        </div>
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
                iconOnly={false}
                closeMobile={closeMobile}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const iconOnly = collapsed && !mobileOpen;

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
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-700 text-sm font-semibold text-white"></div>
            {(!collapsed || mobileOpen) && (
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100"></p>
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
        <nav className="flex flex-1 flex-col overflow-y-auto px-2 py-2">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-1">
              {!iconOnly && (
                <p className="mb-1 mt-3 px-3 text-[10px] font-medium uppercase tracking-wider text-slate-400 first:mt-1 dark:text-slate-500">
                  {group.label}
                </p>
              )}
              {iconOnly && (
                <div className="mx-2 my-1 hidden border-t border-slate-100 dark:border-slate-700 md:block" />
              )}

              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <NavItem
                    key={item.to}
                    item={item}
                    iconOnly={iconOnly}
                    closeMobile={closeMobile}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer: toggle tema */}
        <div className="border-t border-slate-200 px-2 py-3 dark:border-slate-700">
          <button
            onClick={() => setDark((d) => !d)}
            title={iconOnly ? (dark ? "Mode terang" : "Mode gelap") : undefined}
            className={cn(
              ROW,
              "w-full py-2",
              IDLE,
              iconOnly ? "md:justify-center md:px-2" : "gap-3 px-3"
            )}
          >
            {dark ? (
              <Sun className="h-[18px] w-[18px] shrink-0" />
            ) : (
              <Moon className="h-[18px] w-[18px] shrink-0" />
            )}
            {!iconOnly && <span>{dark ? "Mode Terang" : "Mode Gelap"}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}