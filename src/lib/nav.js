
const ALLOWED_KEYS = ["label", "group", "order", "defaultOpen", "toggleOnly", "flat", "hidden"];

const navModules = import.meta.glob("/src/pages/**/nav.js", {
  eager: true,
  import: "default",
});

function folderToPath(file) {
  const path = file
    .replace("/src/pages", "")
    .replace(/\/nav\.js$/, "")
    .split("/")
    .map((s) => s.toLowerCase())
    .join("/");
  return path || "/";
}

function titleCase(path) {
  const last = path.split("/").filter(Boolean).pop() || "Beranda";
  return last
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
function findParent(to, byPath) {
  const parts = to.split("/").filter(Boolean);
  for (let i = parts.length - 1; i > 0; i--) {
    const candidate = "/" + parts.slice(0, i).join("/");
    if (byPath.has(candidate)) return byPath.get(candidate);
  }
  return null;
}

function warnUnknownKeys(file, meta) {
  if (!import.meta.env.DEV) return;
  const unknown = Object.keys(meta).filter((k) => !ALLOWED_KEYS.includes(k));
  if (unknown.length) {
    console.warn(
      `[nav] ${file}: kunci tidak dikenal (${unknown.join(", ")}). Yang didukung: ${ALLOWED_KEYS.join(", ")}`
    );
  }
}

function buildNav() {
  const items = Object.entries(navModules)
    .filter(([file, meta]) => {
      if (!meta || typeof meta !== "object") return false;
      warnUnknownKeys(file, meta);
      return meta.hidden !== true && !file.includes("[");
    })
    .map(([file, meta]) => {
      const to = folderToPath(file);
      return {
        to,
        label: meta.label ?? titleCase(to),
        group: meta.group ?? "Menu",
        order: meta.order ?? 100,
        flat: meta.flat === true,
        defaultOpen: meta.defaultOpen === true,
        toggleOnly: meta.toggleOnly === true,
        children: [],
      };
    })
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));

  const byPath = new Map(items.map((i) => [i.to, i]));
  const top = [];

  for (const item of items) {
    const parent = item.flat ? null : findParent(item.to, byPath);
    if (parent) parent.children.push(item);
    else top.push(item);
  }

  // Kelompokkan berdasarkan group, urutan group mengikuti item pertama
  const groups = [];
  for (const item of top) {
    let g = groups.find((x) => x.label === item.group);
    if (!g) {
      g = { label: item.group, items: [] };
      groups.push(g);
    }
    g.items.push(item);
  }
  return groups;
}

export const NAV_GROUPS = buildNav();