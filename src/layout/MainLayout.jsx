import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, User, LogOut, ChevronDown } from "lucide-react";
import { Sidebar } from "@/layout/Sitebar";
import { cn } from "@/lib/utils";

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50";
const USER = { name: "testing", role: "Administrator" };

const initials = (name) =>
  name
    .split(" ")
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

function ThemeButton({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={dark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      title={dark ? "Mode terang" : "Mode gelap"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors",
        "hover:bg-slate-100 hover:text-slate-900",
        "dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
        FOCUS
      )}
    >
      {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}

function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item =
    "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition-colors",
          "hover:bg-slate-100 dark:hover:bg-slate-800",
          FOCUS
        )}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-700 text-xs font-semibold text-white">
          {initials(user.name)}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">
            {user.name}
          </span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            {user.role}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "hidden h-4 w-4 text-slate-400 transition-transform duration-200 sm:block",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-1.5 shadow-md dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="px-3 py-2 sm:hidden">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
          </div>

          <button
            role="menuitem"
            onClick={() => setOpen(false)}
            className={cn(
              item,
              "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            )}
          >
            <User className="h-4 w-4 text-slate-400" />
            Profil saya
          </button>

          <div className="my-1 border-t border-slate-200 dark:border-slate-700" />

          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className={cn(
              item,
              "text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
            )}
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}

export default function MainLayout({ children }) {
  const navigate = useNavigate();

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const handleLogout = () => {
    // Sesuaikan dengan sistem auth kamu (hapus token / panggil API logout)
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="relative z-20 flex h-14 shrink-0 items-center justify-end gap-2 border-b border-slate-200 bg-white pl-16 pr-4 dark:border-slate-700 dark:bg-slate-900 md:pl-5 md:pr-5">
          <ThemeButton dark={dark} onToggle={() => setDark((d) => !d)} />
          <div className="mx-1 h-6 border-l border-slate-200 dark:border-slate-700" />
          <ProfileMenu user={USER} onLogout={handleLogout} />
        </header>

        <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}