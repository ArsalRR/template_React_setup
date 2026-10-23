import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export default function SearchSelect({
    options = [],
    value,
    onChange,
    valueKey = "id",
    labelKey = "nama",
    secondaryKey,
    searchKeys,
    placeholder = "Pilih data",
    searchPlaceholder = "Cari...",
    emptyText = "Data tidak ditemukan.",
    invalid = false,
    disabled = false,
    id,
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const wrapRef = useRef(null);

    const selected = options.find((o) => String(o[valueKey]) === String(value ?? ""));

    const close = () => {
        setOpen(false);
        setQuery("");
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) close();
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const getSearchText = (o) => {
        const keys = searchKeys && searchKeys.length ? searchKeys : Object.keys(o);
        return keys
            .map((k) => o[k])
            .filter((v) => typeof v === "string" || typeof v === "number")
            .join(" ")
            .toLowerCase();
    };

    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const filtered = tokens.length
        ? options.filter((o) => {
              const text = getSearchText(o);
              return tokens.every((t) => text.includes(t));
          })
        : options;

    return (
        <div ref={wrapRef} className="relative">
            <button
                id={id}
                type="button"
                disabled={disabled}
                onClick={() => setOpen((o) => !o)}
                aria-invalid={invalid}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 text-left text-base text-slate-900 shadow-sm disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-[#7a1329] dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
            >
                <span className={`truncate ${selected ? "" : "text-slate-400 dark:text-slate-500"}`}>
                    {selected ? selected[labelKey] : placeholder}
                </span>
                <ChevronDown
                    className={`ml-2 h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                    <div className="border-b border-slate-100 p-2 dark:border-slate-800">
                        <input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Escape" && close()}
                            placeholder={searchPlaceholder}
                            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#7a1329] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>
                    <ul className="max-h-56 overflow-y-auto py-1">
                        {filtered.length === 0 && (
                            <li className="px-3 py-2 text-sm text-slate-400 dark:text-slate-500">
                                {emptyText}
                            </li>
                        )}
                        {filtered.map((o) => {
                            const optValue = String(o[valueKey]);
                            const isSelected = optValue === String(value ?? "");
                            const secondary = secondaryKey ? o[secondaryKey] : "";
                            return (
                                <li
                                    key={optValue}
                                    onClick={() => {
                                        onChange(optValue);
                                        close();
                                    }}
                                    className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-[#7a1329]/10 hover:text-[#7a1329] dark:hover:bg-[#7a1329]/10 dark:hover:text-[#c25a70] ${
                                        isSelected
                                            ? "bg-[#7a1329]/10 font-medium text-[#7a1329] dark:text-[#c25a70]"
                                            : "text-slate-700 dark:text-slate-300"
                                    }`}
                                >
                                    <span className="min-w-0 truncate">{o[labelKey]}</span>
                                    {secondary ? (
                                        <span className="shrink-0 text-xs opacity-70">{secondary}</span>
                                    ) : null}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}