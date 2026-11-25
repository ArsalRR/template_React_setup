import fs from "node:fs";
import path from "node:path";

export const THEME_FILE = path.join(process.cwd(), "src", "lib", "sidebar-theme.js");

export const HEX = {
  slate: "#334155",
  gray: "#374151",
  zinc: "#3f3f46",
  neutral: "#404040",
  stone: "#44403c",
  red: "#b91c1c",
  orange: "#c2410c",
  amber: "#b45309",
  yellow: "#a16207",
  lime: "#4d7c0f",
  green: "#15803d",
  emerald: "#047857",
  teal: "#0f766e",
  cyan: "#0e7490",
  sky: "#0369a1",
  blue: "#1d4ed8",
  indigo: "#4338ca",
  violet: "#6d28d9",
  purple: "#7e22ce",
  fuchsia: "#a21caf",
  pink: "#be185d",
  rose: "#be123c",
};

export const COLORS = Object.keys(HEX);

export const ALIASES = {
  merah: "red",
  biru: "blue",
  hijau: "green",
  kuning: "yellow",
  oranye: "orange",
  jingga: "orange",
  ungu: "purple",
  abu: "gray",
  hitam: "zinc",
  nila: "indigo",
  tosca: "teal",
  merahmuda: "pink",
};

const COLOR_LINE = /export const SIDEBAR_COLOR = "([a-z]+)";/;
const CONFIGURED_LINE = /export const SIDEBAR_CONFIGURED = (true|false);/;

export function readTheme() {
  if (!fs.existsSync(THEME_FILE)) return null;
  const source = fs.readFileSync(THEME_FILE, "utf8");
  const color = COLOR_LINE.exec(source)?.[1];
  const configured = CONFIGURED_LINE.exec(source)?.[1];
  if (!color || !configured) return null;
  return { color, configured: configured === "true" };
}

export function writeTheme(color) {
  const source = fs.readFileSync(THEME_FILE, "utf8");
  const next = source
    .replace(COLOR_LINE, `export const SIDEBAR_COLOR = "${color}";`)
    .replace(CONFIGURED_LINE, "export const SIDEBAR_CONFIGURED = true;");
  fs.writeFileSync(THEME_FILE, next);
}

export function resolveColor(input) {
  const typed = String(input).trim().toLowerCase();
  const color = ALIASES[typed] ?? typed;
  return COLORS.includes(color) ? color : null;
}