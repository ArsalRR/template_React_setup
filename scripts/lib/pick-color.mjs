import readline from "node:readline";
import { COLORS, HEX } from "./sidebar-colors.mjs";

const COLS = 3;
const ROWS = Math.ceil(COLORS.length / COLS);
const LINES = ROWS + 3;

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const bg = (hex, text) => {
  const [r, g, b] = rgb(hex);
  return `\x1b[48;2;${r};${g};${b}m${text}\x1b[0m`;
};

function render(index) {
  const out = ["Pilih warna sidebar (shade 700)"];
  for (let r = 0; r < ROWS; r++) {
    let line = "";
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      if (i >= COLORS.length) break;
      const name = COLORS[i];
      const cell = `${bg(HEX[name], "   ")} ${name.padEnd(8)}`;
      line += i === index ? `\x1b[1m> ${cell}\x1b[0m` : `  ${cell}`;
    }
    out.push(line);
  }
  const chosen = COLORS[index];
  out.push("");
  out.push(`${bg(HEX[chosen], "      ")} ${chosen}-700 ${HEX[chosen]}   (panah = pindah, Enter = pakai, Esc = lewati)`);
  return out.join("\n") + "\n";
}

export function pickColor(initial) {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY || !process.stdout.isTTY) return resolve(null);

    const total = COLORS.length;
    let index = Math.max(0, COLORS.indexOf(initial));

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdout.write("\x1b[?25l");
    process.stdout.write(render(index));

    const finish = (value) => {
      process.stdin.off("keypress", onKey);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\x1b[?25h");
      resolve(value);
    };

    const redraw = () => {
      process.stdout.write(`\x1b[${LINES}A\x1b[0J`);
      process.stdout.write(render(index));
    };

    function onKey(_, key = {}) {
      if (key.name === "return" || key.name === "enter") return finish(COLORS[index]);
      if (key.name === "escape" || (key.ctrl && key.name === "c") || key.name === "q") return finish(null);
      if (key.name === "left") index = (index - 1 + total) % total;
      else if (key.name === "right") index = (index + 1) % total;
      else if (key.name === "up" && index - COLS >= 0) index -= COLS;
      else if (key.name === "down" && index + COLS < total) index += COLS;
      else return;
      redraw();
    }

    process.stdin.on("keypress", onKey);
  });
}