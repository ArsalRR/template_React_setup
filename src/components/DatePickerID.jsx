import { useState, useRef, useEffect } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const DAYS_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function DatePickerID({
  value,
  onChange,
  error,
  placeholder = "Pilih tanggal",
  disableWeekend = true,
  disableHoliday = true,
}) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [liburSet, setLiburSet] = useState(new Set());
  const wrapRef = useRef();
  const today = new Date();

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!disableHoliday) return;
    getConfiqHariLibur()
      .then((res) => {
        const list = res?.data ?? res ?? [];
        setLiburSet(new Set(list.map((item) => (item.tanggal ?? item).slice(0, 10))));
      })
      .catch(console.error);
  }, [disableHoliday]);

  const changeMonth = (dir) => {
    let m = viewMonth + dir, y = viewYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setViewMonth(m); setViewYear(y);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const toKey = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const displayValue = selectedDate
    ? `${DAYS_ID[selectedDate.getDay()]}, ${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
    : null;
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => {
          if (value) {
            const d = new Date(value + "T00:00:00");
            setViewYear(d.getFullYear());
            setViewMonth(d.getMonth());
          }
          setOpen((o) => !o);
        }}
        className={`w-full h-11 rounded-xl border px-4 flex items-center gap-2.5 shadow-sm text-sm transition-colors text-left
          ${error ? "border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-700"
            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500"}
          ${open ? "border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/40" : ""}`}
      >
        <svg className="size-4 text-slate-400 dark:text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className={`flex-1 ${displayValue ? "text-slate-800 dark:text-slate-100 font-medium" : "text-slate-400 dark:text-slate-500"}`}>
          {displayValue ?? placeholder}
        </span>
        {value && (
          <span role="button" onClick={(e) => { e.stopPropagation(); onChange(""); }} className="text-slate-400 hover:text-red-500 transition-colors">
            <X className="size-3.5" />
          </span>
        )}
        <ChevronRight className={`size-3.5 text-slate-400 dark:text-slate-500 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1.5 w-[300px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <button type="button" onClick={() => changeMonth(-1)}
              className="size-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
              <ChevronLeft className="size-3.5 text-slate-500 dark:text-slate-400" />
            </button>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={() => changeMonth(1)}
              className="size-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
              <ChevronRight className="size-3.5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          <div className="p-3">
            <div className="grid grid-cols-7 mb-1">
              {DAYS_ID.map((d, i) => (
                <div key={d} className={`text-center text-[10px] font-bold py-1.5 ${i === 0 || i === 6 ? "text-red-400" : "text-slate-400 dark:text-slate-500"}`}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateKey = toKey(viewYear, viewMonth, day);
                const date = new Date(viewYear, viewMonth, day);
                const isToday = date.toDateString() === today.toDateString();
                const isSel = value === dateKey;
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const isLibur = disableHoliday && liburSet.has(dateKey);
                const isDisabled = (disableWeekend && isWeekend) || isLibur;
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isDisabled}
                    title={isLibur ? "Hari libur" : undefined}
                    onClick={() => { onChange(dateKey); setOpen(false); }}
                    className={`text-xs py-2 rounded-lg transition-all text-center font-medium
                      ${isLibur ? "text-red-400 dark:text-red-500/70 cursor-not-allowed"
                        : isDisabled ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                        : isSel ? "bg-blue-600 text-white shadow-sm"
                        : isToday ? "border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-3 pb-3">
            <button
              type="button"
              onClick={() => { onChange(todayKey); setOpen(false); }}
              className="w-full py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-xs text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Hari ini — {today.getDate()} {MONTHS[today.getMonth()]} {today.getFullYear()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePickerID;