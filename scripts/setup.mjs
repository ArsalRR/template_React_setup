import { readTheme, writeTheme } from "./lib/sidebar-colors.mjs";
import { pickColor } from "./lib/pick-color.mjs";

async function main() {
  const theme = readTheme();
  if (!theme || theme.configured) return;
  if (process.env.CI) return;

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.log("\nPilih warna sidebar dengan: npm run sidebar color\n");
    return;
  }

  console.log("\nSelamat datang! Atur tampilan aplikasi dulu.\n");
  const color = await pickColor(theme.color);

  if (!color) {
    console.log("\nDilewati. Pilih nanti dengan: npm run sidebar color\n");
    return;
  }

  writeTheme(color);
  console.log(`\nWarna sidebar: ${color}-700`);
  console.log("Ganti kapan saja dengan: npm run sidebar color\n");
}

main()
  .catch(() => {})
  .finally(() => process.exit(0));