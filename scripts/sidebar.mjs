import { COLORS, readTheme, writeTheme, resolveColor } from "./lib/sidebar-colors.mjs";
import { pickColor } from "./lib/pick-color.mjs";

const USAGE =
  "Gunakan: npm run sidebar color [warna]\n" +
  "Tanpa warna: tampil pilihan interaktif.\n" +
  "Contoh : npm run sidebar color blue  (atau: biru, merah, hijau, ...)\n" +
  "Warna  : " + COLORS.join(", ");

function fail(message) {
  console.error(message + "\n\n" + USAGE);
  process.exit(1);
}

function apply(theme, color) {
  if (color === theme.color && theme.configured) {
    console.log(`Warna sidebar sudah ${color}-700.`);
    return;
  }
  writeTheme(color);
  console.log(`Warna sidebar: ${theme.color}-700 -> ${color}-700`);
}

const [command, rawColor] = process.argv.slice(2);

if (command !== "color") fail(command ? `Perintah tidak dikenal: "${command}".` : "Perintah belum diisi.");

const theme = readTheme();
if (!theme) fail("File src/lib/sidebar-theme.js tidak ditemukan atau formatnya tidak dikenali.");

if (!rawColor) {
  const picked = await pickColor(theme.color);
  if (!picked) {
    console.log(`Warna sidebar saat ini: ${theme.color}-700\n\n${USAGE}`);
    process.exit(0);
  }
  apply(theme, picked);
  process.exit(0);
}

const color = resolveColor(rawColor);
if (!color) {
  const typed = rawColor.trim().toLowerCase();
  const hints = COLORS.filter((c) => c.includes(typed) || typed.includes(c)).slice(0, 4);
  fail(`Warna "${rawColor}" tidak ada di palet Tailwind.` + (hints.length ? ` Mungkin: ${hints.join(", ")}.` : ""));
}

apply(theme, color);