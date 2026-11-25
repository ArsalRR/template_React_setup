export const SIDEBAR_COLOR = "blue";
export const SIDEBAR_CONFIGURED = true;

const THEMES = {
  slate: { active: "bg-slate-700 font-medium text-white", ring: "focus-visible:ring-slate-700/50" },
  gray: { active: "bg-gray-700 font-medium text-white", ring: "focus-visible:ring-gray-700/50" },
  zinc: { active: "bg-zinc-700 font-medium text-white", ring: "focus-visible:ring-zinc-700/50" },
  neutral: { active: "bg-neutral-700 font-medium text-white", ring: "focus-visible:ring-neutral-700/50" },
  stone: { active: "bg-stone-700 font-medium text-white", ring: "focus-visible:ring-stone-700/50" },
  red: { active: "bg-red-700 font-medium text-white", ring: "focus-visible:ring-red-700/50" },
  orange: { active: "bg-orange-700 font-medium text-white", ring: "focus-visible:ring-orange-700/50" },
  amber: { active: "bg-amber-700 font-medium text-white", ring: "focus-visible:ring-amber-700/50" },
  yellow: { active: "bg-yellow-700 font-medium text-white", ring: "focus-visible:ring-yellow-700/50" },
  lime: { active: "bg-lime-700 font-medium text-white", ring: "focus-visible:ring-lime-700/50" },
  green: { active: "bg-green-700 font-medium text-white", ring: "focus-visible:ring-green-700/50" },
  emerald: { active: "bg-emerald-700 font-medium text-white", ring: "focus-visible:ring-emerald-700/50" },
  teal: { active: "bg-teal-700 font-medium text-white", ring: "focus-visible:ring-teal-700/50" },
  cyan: { active: "bg-cyan-700 font-medium text-white", ring: "focus-visible:ring-cyan-700/50" },
  sky: { active: "bg-sky-700 font-medium text-white", ring: "focus-visible:ring-sky-700/50" },
  blue: { active: "bg-blue-700 font-medium text-white", ring: "focus-visible:ring-blue-700/50" },
  indigo: { active: "bg-indigo-700 font-medium text-white", ring: "focus-visible:ring-indigo-700/50" },
  violet: { active: "bg-violet-700 font-medium text-white", ring: "focus-visible:ring-violet-700/50" },
  purple: { active: "bg-purple-700 font-medium text-white", ring: "focus-visible:ring-purple-700/50" },
  fuchsia: { active: "bg-fuchsia-700 font-medium text-white", ring: "focus-visible:ring-fuchsia-700/50" },
  pink: { active: "bg-pink-700 font-medium text-white", ring: "focus-visible:ring-pink-700/50" },
  rose: { active: "bg-rose-700 font-medium text-white", ring: "focus-visible:ring-rose-700/50" },
};

export const SIDEBAR_THEME = THEMES[SIDEBAR_COLOR] ?? THEMES.rose;