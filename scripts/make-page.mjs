
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";

const BOOL_FLAGS = ["flat", "no-nav", "service", "resource", "form"];
const SEGMENT = /^(\[[a-z0-9_-]+\]|[a-z0-9_-]+)$/;
const ROOT = process.cwd();
const pagesRoot = path.join(ROOT, "src", "pages");
const serviceDir = path.join(ROOT, "src", "service");

const USAGE =
  'Gunakan: npm run page -- <folder> [--dropdown a,b] [--service | --resource [--form]] [--api path]\n' +
  '                           [--label "Nama"] [--group "Grup"] [--order 10] [--flat] [--no-nav]\n' +
  "Atau jalankan tanpa argumen (npm run page) untuk mode interaktif.";
function parseArgs(argv) {
  const flags = {};
  const positional = [];
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
  return { flags, positional };
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const toWords = (seg) =>
  seg
    .replace(/[\[\]]/g, "")
    .split(/[-_]/)
    .filter(Boolean)
    .map(cap);

const isDynamic = (segments) => segments.some((s) => s.startsWith("["));

function assertSegments(segments) {
  if (!segments.length) throw new Error("Nama folder wajib diisi.");
  if (!segments.every((s) => SEGMENT.test(s))) {
    throw new Error(
      `Nama folder tidak valid: "${segments.join("/")}". Pakai huruf kecil, angka, - dan _ (atau [param]).`
    );
  }
}

function nextOrder(parentDir) {
  if (!fs.existsSync(parentDir)) return 10;
  const count = fs
    .readdirSync(parentDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(parentDir, d.name, "nav.js"))).length;
  return count * 10 + 10;
}

function writeSafe(file, content) {
  const rel = path.relative(ROOT, file);
  if (fs.existsSync(file)) {
    console.log("Dilewati (sudah ada): " + rel);
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  console.log("Dibuat: " + rel);
}

function parseChildren(spec) {
  return spec
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((item) => {
      const [rawName, ...rawLabel] = item.split(":");
      const name = rawName.trim().toLowerCase();
      assertSegments([name]);
      return { name, label: rawLabel.join(":").trim() || undefined };
    });
}
function pageSource(label, component, createLink) {
  const lines = [];
  if (createLink) lines.push(`import { Link } from "react-router-dom";`, ``);
  lines.push(
    `export const title = ${JSON.stringify(label)};`,
    ``,
    `export default function ${component}() {`,
    `  return (`,
    `    <div className="space-y-4">`,
    `      <div className="flex items-start justify-between gap-4">`,
    `        <div className="space-y-1">`,
    `          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">`,
    `            ${label}`,
    `          </h1>`,
    `          <p className="text-sm text-slate-500 dark:text-slate-400">`,
    `            Halaman ${label}.`,
    `          </p>`,
    `        </div>`
  );
  if (createLink) {
    lines.push(
      `        <Link`,
      `          to=${JSON.stringify(createLink)}`,
      `          className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"`,
      `        >`,
      `          Tambah`,
      `        </Link>`
    );
  }
  lines.push(
    `      </div>`,
    `    </div>`,
    `  );`,
    `}`,
    ``
  );
  return lines.join("\n");
}
function createPage(segments, opts = {}) {
  assertSegments(segments);

  const words = toWords(segments[segments.length - 1]);
  const label = opts.label ?? words.join(" ");
  const joined = words.join("");
  const component = (/^\d/.test(joined) ? "Halaman" : "") + joined + "Page";
  const dir = path.join(pagesRoot, ...segments);
  const parentDir = path.join(pagesRoot, ...segments.slice(0, -1));
  const noNav = opts.noNav || isDynamic(segments);
  const topLevel = segments.length === 1 || opts.flat;

  writeSafe(path.join(dir, "index.jsx"), pageSource(label, component, opts.createLink));

  if (!noNav) {
    const lines = [`export default {`, `  label: ${JSON.stringify(label)},`];
    if (topLevel) lines.push(`  group: ${JSON.stringify(opts.group ?? "Menu")},`);
    lines.push(`  order: ${opts.order ?? nextOrder(parentDir)},`);
    if (opts.flat) lines.push(`  flat: true,`);
    lines.push(`};`, ``);
    writeSafe(path.join(dir, "nav.js"), lines.join("\n"));
  }

  console.log("Route: /" + segments.join("/") + "\n");
}

/* ------------------------------ service ------------------------------ */

const API_SOURCE = [
  "import axios from 'axios';",
  "",
  "const api = axios.create({",
  "  baseURL: import.meta.env.VITE_API_URL,",
  "  headers: { Accept: 'application/json' },",
  "});",
  "",
  "api.interceptors.request.use((config) => {",
  "  const token = localStorage.getItem('token');",
  "  if (token) config.headers.Authorization = `Bearer ${token}`;",
  "  return config;",
  "});",
  "",
  "export default api;",
  "",
].join("\n");

function pluralize(w) {
  if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + "ies";
  if (/(s|x|z|ch|sh)$/.test(w)) return w + "es";
  return w + "s";
}
function serviceNames(segments) {
  const words = segments.flatMap((s) => s.split(/[-_]/).filter(Boolean)).map((w) => w.toLowerCase());
  const plural = [...words.slice(0, -1), pluralize(words[words.length - 1])];
  const pascalSingular = words.map(cap).join("");
  return {
    file: pascalSingular.charAt(0).toLowerCase() + pascalSingular.slice(1) + "Service",
    fn: plural.map(cap).join(""),
    endpoint: plural.join("-"),
  };
}

function serviceSource(fn, endpoint, resource) {
  const lines = [
    `import api from './api';`,
    ``,
    `export const get${fn} = async (params = {}) => {`,
    `  const { data } = await api.get('${endpoint}', { params });`,
    `  return data;`,
    `};`,
  ];
  if (resource) {
    lines.push(
      `export const Post${fn} = async (data) => (await api.post('${endpoint}', data)).data;`,
      `export const get${fn}ById = async (id) => (await api.get(\`${endpoint}/\${id}\`)).data;`,
      `export const Update${fn} = async (id, data) => (await api.put(\`${endpoint}/\${id}\`, data)).data;`,
      `export const delete${fn} = async (id) => (await api.delete(\`${endpoint}/\${id}\`)).data;`
    );
  }
  lines.push("");
  return lines.join("\n");
}

function createService(segments, mode, endpointOverride) {
  if (isDynamic(segments)) {
    console.log("Service dilewati untuk folder dinamis [param].\n");
    return;
  }
  const names = serviceNames(segments);
  const endpoint = endpointOverride ?? names.endpoint;

  writeSafe(path.join(serviceDir, "api.js"), API_SOURCE);
  writeSafe(
    path.join(serviceDir, `${names.file}.js`),
    serviceSource(names.fn, endpoint, mode === "resource")
  );
  console.log(`Endpoint: /${endpoint}  |  Mode: ${mode === "resource" ? "resource (CRUD)" : "GET saja"}\n`);
}
const H1 = "text-lg font-semibold text-slate-900 dark:text-slate-100";
const MUTED = "text-sm text-slate-500 dark:text-slate-400";
const BACK = "text-sm text-slate-600 underline dark:text-slate-300";

function createFormSource(label, component, backTo, fn) {
  return [
    `import { Link } from "react-router-dom";`,
    ``,
    `export const title = ${JSON.stringify("Tambah " + label)};`,
    ``,
    `export default function ${component}() {`,
    `  return (`,
    `    <div className="space-y-4">`,
    `      <h1 className="${H1}">`,
    `        Tambah ${label}`,
    `      </h1>`,
    `      <p className="${MUTED}">`,
    `        Isi form di sini, lalu kirim dengan Post${fn} dari service.`,
    `      </p>`,
    `      <Link to=${JSON.stringify(backTo)} className="${BACK}">`,
    `        Kembali`,
    `      </Link>`,
    `    </div>`,
    `  );`,
    `}`,
    ``,
  ].join("\n");
}

function editFormSource(label, component, backTo, fn) {
  return [
    `import { Link, useParams } from "react-router-dom";`,
    ``,
    `export const title = ${JSON.stringify("Ubah " + label)};`,
    ``,
    `export default function ${component}() {`,
    `  const { id } = useParams();`,
    ``,
    `  return (`,
    `    <div className="space-y-4">`,
    `      <h1 className="${H1}">`,
    `        Ubah ${label}`,
    `      </h1>`,
    `      <p className="${MUTED}">`,
    `        ID: {id}. Ambil data dengan get${fn}ById, lalu simpan dengan Update${fn}.`,
    `      </p>`,
    `      <Link to=${JSON.stringify(backTo)} className="${BACK}">`,
    `        Kembali`,
    `      </Link>`,
    `    </div>`,
    `  );`,
    `}`,
    ``,
  ].join("\n");
}

function createFormPages(segments, label) {
  if (isDynamic(segments)) return;

  const dir = path.join(pagesRoot, ...segments);
  const backTo = "/" + segments.join("/");
  const base = segments.flatMap(toWords).join("");
  const prefix = /^\d/.test(base) ? "Halaman" : "";
  const { fn } = serviceNames(segments);

  writeSafe(
    path.join(dir, "create.jsx"),
    createFormSource(label, `${prefix}${base}CreatePage`, backTo, fn)
  );
  writeSafe(
    path.join(dir, "[id]", "edit.jsx"),
    editFormSource(label, `${prefix}${base}EditPage`, backTo, fn)
  );
  console.log(`Route: ${backTo}/create dan ${backTo}/:id/edit\n`);
}
function run(config) {
  const { segments, children, service } = config;
  const withForm = config.form && service === "resource";
  const selfLabel = config.label ?? toWords(segments[segments.length - 1]).join(" ");

  createPage(segments, {
    label: config.label,
    group: config.group,
    order: config.order,
    flat: config.flat,
    noNav: config.noNav,
    createLink:
      withForm && children.length === 0 && !isDynamic(segments)
        ? "/" + segments.join("/") + "/create"
        : undefined,
  });

  for (const child of children) {
    const childSegments = [...segments, child.name];
    createPage(childSegments, {
      label: child.label,
      createLink: withForm ? "/" + childSegments.join("/") + "/create" : undefined,
    });
  }

  if (service !== "none") {
    if (children.length > 0) {
      for (const child of children) createService([...segments, child.name], service);
    } else {
      createService(segments, service, config.api);
    }
  }

  if (withForm) {
    if (children.length > 0) {
      for (const child of children) {
        createFormPages([...segments, child.name], child.label ?? toWords(child.name).join(" "));
      }
    } else {
      createFormPages(segments, selfLabel);
    }
  }

  if (config.dropdown && children.length === 0) {
    console.log(
      `Dropdown siap. Tambah anak dengan: npm run page -- ${segments.join("/")} --dropdown nama1,nama2`
    );
  }
}

function configFromFlags(target, flags) {
  const segments = target
    .split("/")
    .filter(Boolean)
    .map((s) => s.toLowerCase());
  assertSegments(segments);

  if (flags.form === true && flags.resource !== true) {
    console.warn("Peringatan: --form hanya berlaku bersama --resource, jadi diabaikan.\n");
  }

  return {
    segments,
    label: typeof flags.label === "string" ? flags.label : undefined,
    group: typeof flags.group === "string" ? flags.group : undefined,
    order:
      flags.order !== undefined && Number.isFinite(Number(flags.order)) ? Number(flags.order) : undefined,
    flat: flags.flat === true,
    noNav: flags["no-nav"] === true,
    dropdown: flags.dropdown !== undefined,
    children: typeof flags.dropdown === "string" ? parseChildren(flags.dropdown) : [],
    service: flags.resource === true ? "resource" : flags.service === true ? "get" : "none",
    form: flags.form === true && flags.resource === true,
    api: typeof flags.api === "string" ? flags.api.replace(/^\/+|\/+$/g, "") : undefined,
  };
}

async function askInteractive() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = async (question, def = "") => {
    const answer = (await rl.question(def ? `${question} [${def}]: ` : `${question}: `)).trim();
    return answer || def;
  };
  const choose = async (title, options) => {
    console.log(`\n${title}`);
    options.forEach((o, i) => console.log(`  ${i + 1}) ${o}`));
    while (true) {
      const n = Number(await ask("Pilih", "1"));
      if (Number.isInteger(n) && n >= 1 && n <= options.length) return n;
      console.log("Masukkan angka yang tersedia.");
    }
  };

  try {
    console.log("\nBuat halaman baru (tekan Enter untuk memakai nilai di dalam [ ])\n");

    let segments;
    while (true) {
      const raw = (await ask("Nama folder (contoh: surat atau surat/masuk)")).toLowerCase();
      segments = raw.split("/").filter(Boolean);
      try {
        assertSegments(segments);
        break;
      } catch (err) {
        console.log(err.message);
      }
    }

    const last = segments[segments.length - 1];
    const label = await ask("Label menu", toWords(last).join(" "));
    const group = segments.length === 1 ? await ask("Grup sidebar", "Menu") : undefined;

    const menuType = await choose("Tipe menu", ["Single (satu menu)", "Dropdown (induk + submenu)"]);

    let children = [];
    if (menuType === 2) {
      while (true) {
        const raw = await ask("Nama submenu, pisahkan koma (contoh: masuk:Surat Masuk,keluar)");
        try {
          children = raw ? parseChildren(raw) : [];
          break;
        } catch (err) {
          console.log(err.message);
        }
      }
    }

    const serviceChoice = await choose(
      children.length ? "Service API (dibuat untuk setiap submenu)" : "Service API",
      ["Tanpa service", "Service GET saja", "Service resource (CRUD lengkap)"]
    );
    const service = ["none", "get", "resource"][serviceChoice - 1];

    // Pertanyaan ini hanya muncul kalau memilih nomor 3 (resource)
    let form = false;
    if (service === "resource" && !isDynamic(segments)) {
      const formChoice = await choose(
        children.length
          ? "Buat juga create.jsx dan edit.jsx untuk setiap submenu?"
          : "Buat juga create.jsx dan edit.jsx?",
        ["Tidak, index saja", "Ya, buatkan create.jsx dan edit.jsx"]
      );
      form = formChoice === 2;
    }

    let api;
    if (service !== "none" && children.length === 0 && !isDynamic(segments)) {
      const def = serviceNames(segments).endpoint;
      api = (await ask("Endpoint API", def)).replace(/^\/+|\/+$/g, "");
    }

    console.log("");
    return {
      segments,
      label,
      group,
      order: undefined,
      flat: false,
      noNav: false,
      dropdown: menuType === 2,
      children,
      service,
      form,
      api,
    };
  } finally {
    rl.close();
  }
}

async function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2));
  const target = positional[0];

  if (!target && !process.stdin.isTTY) {
    console.error(USAGE);
    process.exit(1);
  }

  const config = target ? configFromFlags(target, flags) : await askInteractive();
  run(config);
}

main().catch((err) => {
  console.error("\nGagal: " + err.message);
  console.error("\n" + USAGE);
  process.exit(1);
});
