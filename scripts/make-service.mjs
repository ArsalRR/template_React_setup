#!/usr/bin/env node
// Pemakaian:
//   npm run make:service -- Asset --resource     (CRUD lengkap)
//   npm run make:service -- Dashboard            (hanya GET)
//   npm run make:service -- Asset --resource --endpoint master/assets
//   npm run make:service -- Asset --resource --force   (timpa file yang sudah ada)
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const target = args.find((a, i) => !a.startsWith("--") && !(args[i - 1] === "--endpoint"));

function opt(name) {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const v = args[i + 1];
  return v && !v.startsWith("--") ? v : true;
}

if (!target) {
  console.error("Gunakan: npm run make:service -- <Nama> [--resource] [--endpoint path] [--force]");
  process.exit(1);
}

const resource = opt("resource") === true;
const force = opt("force") === true;

// "Asset", "asset", "AssetCategory", "asset-category" -> ["asset", "category"]
const words = target
  .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
  .toLowerCase()
  .split(/[-_\s]+/)
  .filter(Boolean);

if (words.length === 0 || !words.every((w) => /^[a-z0-9]+$/.test(w))) {
  console.error("Nama hanya boleh huruf dan angka, contoh: Asset, AssetCategory, asset-category.");
  process.exit(1);
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function pluralize(w) {
  if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + "ies";
  if (/(s|x|z|ch|sh)$/.test(w)) return w + "es";
  return w + "s";
}

const lastPlural = pluralize(words[words.length - 1]);
const pascalSingular = words.map(cap).join("");
const camelSingular = pascalSingular.charAt(0).toLowerCase() + pascalSingular.slice(1);
const pascalPlural = [...words.slice(0, -1), lastPlural].map(cap).join("");
const endpoint =
  typeof opt("endpoint") === "string"
    ? opt("endpoint").replace(/^\/+|\/+$/g, "")
    : [...words.slice(0, -1), lastPlural].join("-");

const serviceDir = path.join(process.cwd(), "src", "service");
fs.mkdirSync(serviceDir, { recursive: true });

function write(file, content, overwrite = false) {
  const rel = path.relative(process.cwd(), file);
  if (fs.existsSync(file) && !overwrite) {
    console.log("Dilewati (sudah ada): " + rel);
    return;
  }
  fs.writeFileSync(file, content);
  console.log("Dibuat: " + rel);
}

// Klien axios bersama, dibuat sekali saja
const apiSrc = [
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

write(path.join(serviceDir, "api.js"), apiSrc);

const lines = [
  "import api from './api';",
  "",
  `export const get${pascalPlural} = async (params = {}) => {`,
  `  const { data } = await api.get('${endpoint}', { params });`,
  "  return data;",
  "};",
];

if (resource) {
  lines.push(
    `export const Post${pascalPlural} = async (data) => (await api.post('${endpoint}', data)).data;`,
    `export const get${pascalPlural}ById = async (id) => (await api.get(\`${endpoint}/\${id}\`)).data;`,
    `export const Update${pascalPlural} = async (id, data) => (await api.put(\`${endpoint}/\${id}\`, data)).data;`,
    `export const delete${pascalPlural} = async (id) => (await api.delete(\`${endpoint}/\${id}\`)).data;`
  );
}

lines.push("");

write(path.join(serviceDir, `${camelSingular}Service.js`), lines.join("\n"), force);

console.log(`\nEndpoint: /${endpoint}  |  Mode: ${resource ? "resource (CRUD)" : "GET saja"}`);