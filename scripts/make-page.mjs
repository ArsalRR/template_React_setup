
import fs from "node:fs";
import path from "node:path";

const BOOL_FLAGS = ["flat", "no-nav"];
const flags = {};
const positional = [];
const argv = process.argv.slice(2);

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (!a.startsWith("--")) {
    positional.push(a);
    continue;
  }
  const key = a.slice(2);
  const next = argv[i + 1];
  if (!BOOL_FLAGS.includes(key) && next && !next.startsWith("--")) {
    flags[key] = next;
    i++;
  } else {
    flags[key] = true;
  }
}

const target = positional[0];

if (!target) {
  console.error('Gunakan: npm run page -- <folder> [--dropdown a,b,c] [--label "Nama"] [--group "Grup"] [--order 10] [--flat] [--no-nav]');
  process.exit(1);
}

const SEGMENT = /^(\[[a-z0-9_-]+\]|[a-z0-9_-]+)$/;
const pagesRoot = path.join(process.cwd(), "src", "pages");

const toWords = (seg) =>
  seg
    .replace(/[\[\]]/g, "")
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));

function nextOrder(parentDir) {
  if (!fs.existsSync(parentDir)) return 10;
  const count = fs
    .readdirSync(parentDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(parentDir, d.name, "nav.js"))).length;
  return count * 10 + 10;
}

function writeSafe(file, content) {
  const rel = path.relative(process.cwd(), file);
  if (fs.existsSync(file)) {
    console.log("Dilewati (sudah ada): " + rel);
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  console.log("Dibuat: " + rel);
}

function createPage(segments, opts = {}) {
  if (!segments.every((s) => SEGMENT.test(s))) {
    console.error(`Nama folder tidak valid: "${segments.join("/")}". Pakai huruf kecil, angka, - dan _ (atau [param]).`);
    process.exit(1);
  }

  const words = toWords(segments[segments.length - 1]);
  const label = opts.label ?? words.join(" ");
  const dir = path.join(pagesRoot, ...segments);
  const parentDir = path.join(pagesRoot, ...segments.slice(0, -1));
  const noNav = opts.noNav || segments.some((s) => s.startsWith("["));
  const topLevel = segments.length === 1 || opts.flat;

  const pageSrc = [
    `export const title = ${JSON.stringify(label)};`,
    ``,
    `export default function ${words.join("")}Page() {`,
    `  return (`,
    `    <div className="space-y-4">`,
    `      <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">`,
    `        ${label}`,
    `      </h1>`,
    `      <p className="text-sm text-slate-500 dark:text-slate-400">`,
    `        Halaman ${label}.`,
    `      </p>`,
    `    </div>`,
    `  );`,
    `}`,
    ``,
  ].join("\n");

  writeSafe(path.join(dir, "index.jsx"), pageSrc);

  if (!noNav) {
    const navPath = path.join(dir, "nav.js");
    if (fs.existsSync(navPath)) {
      console.log("Dilewati (sudah ada): " + path.relative(process.cwd(), navPath));
    } else {
      const lines = [`export default {`, `  label: ${JSON.stringify(label)},`];
      if (topLevel) lines.push(`  group: ${JSON.stringify(opts.group ?? "Menu")},`);
      lines.push(`  order: ${opts.order ?? nextOrder(parentDir)},`);
      if (opts.flat) lines.push(`  flat: true,`);
      lines.push(`};`, ``);
      writeSafe(navPath, lines.join("\n"));
    }
  }

  console.log("Route: /" + segments.join("/") + "\n");
}
const baseSegments = target
  .split("/")
  .filter(Boolean)
  .map((s) => s.toLowerCase());

const order = flags.order !== undefined && Number.isFinite(Number(flags.order)) ? Number(flags.order) : undefined;

createPage(baseSegments, {
  label: typeof flags.label === "string" ? flags.label : undefined,
  group: typeof flags.group === "string" ? flags.group : undefined,
  order,
  flat: flags.flat === true,
  noNav: flags["no-nav"] === true,
});
if (typeof flags.dropdown === "string") {
  const children = flags.dropdown
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const child of children) {
    const [rawName, ...rawLabel] = child.split(":");
    const name = rawName.trim().toLowerCase();
    const label = rawLabel.join(":").trim() || undefined;
    createPage([...baseSegments, name], { label });
  }
} else if (flags.dropdown === true) {
  console.log(`Dropdown siap. Tambah anak dengan: npm run page -- ${baseSegments.join("/")} --dropdown nama1,nama2`);
}