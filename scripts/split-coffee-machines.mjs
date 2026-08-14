#!/usr/bin/env node
/**
 * Split the coffee-machine style sheet into individual assets:
 * crop each machine (no style labels), white → transparent, PNG + SVG wrapper.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SRC =
  "/home/orson/.cursor/projects/home-orson-Projects-crappy-coffee/assets/c__Users_orson.goitia_AppData_Roaming_Cursor_User_workspaceStorage_d1b1024904b2f1a64b08c07903ce317a_images_coffee-machine-7styles-front-final-b7ac3faf-6215-4755-9f04-29841b315507.png";
const OUT = path.join(__dirname, "../public/assets/coffee-machines");

const NAMES = [
  "anime",
  "manga",
  "candy-game",
  "kawaii",
  "realistic",
  "pixel-art",
  "idle-game",
];

/** Near-white background threshold (JPEG noise). */
function isBg(r, g, b) {
  return r > 235 && g > 235 && b > 235;
}

function findComponents(data, w, h) {
  const visited = new Uint8Array(w * h);
  const comps = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (visited[i]) continue;
      const o = i * 3;
      if (isBg(data[o], data[o + 1], data[o + 2])) {
        visited[i] = 1;
        continue;
      }

      // BFS
      let minX = x,
        maxX = x,
        minY = y,
        maxY = y,
        count = 0;
      const stack = [i];
      visited[i] = 1;
      while (stack.length) {
        const cur = stack.pop();
        const cx = cur % w;
        const cy = (cur / w) | 0;
        count++;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const ni = ny * w + nx;
          if (visited[ni]) continue;
          const no = ni * 3;
          if (isBg(data[no], data[no + 1], data[no + 2])) {
            visited[ni] = 1;
            continue;
          }
          visited[ni] = 1;
          stack.push(ni);
        }
      }
      comps.push({ minX, maxX, minY, maxY, count });
    }
  }
  return comps;
}

function whiteToAlpha(rgba, w, h) {
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    const r = rgba[o];
    const g = rgba[o + 1];
    const b = rgba[o + 2];
    if (isBg(r, g, b)) {
      rgba[o + 3] = 0;
      continue;
    }
    // Soft edge: fade near-white
    const m = Math.min(r, g, b);
    if (m > 210) {
      const t = (m - 210) / (255 - 210);
      rgba[o + 3] = Math.max(0, Math.round(255 * (1 - t)));
    }
  }
  return rgba;
}

function toSvg(pngBuf, width, height, name) {
  const b64 = pngBuf.toString("base64");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Coffee machine — ${name}">
  <title>Coffee machine — ${name}</title>
  <image width="${width}" height="${height}" href="data:image/png;base64,${b64}"/>
</svg>
`;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const { data, info } = await sharp(SRC)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  let comps = findComponents(data, w, h)
    // Machines are tall blobs; drop tiny noise / pure text crumbs
    .filter((c) => c.count > 2500)
    .filter((c) => c.maxY - c.minY > 120)
    .filter((c) => c.maxX - c.minX > 60);

  // Prefer tall machine-shaped boxes (exclude wide label strips if any)
  // Row-band sort: same visual row first (≈40px tolerance), then left→right
  comps = comps
    .map((c) => ({
      ...c,
      aspect: (c.maxY - c.minY + 1) / (c.maxX - c.minX + 1),
    }))
    .filter((c) => c.aspect > 1.2)
    .sort((a, b) => {
      const rowA = Math.round(a.minY / 40);
      const rowB = Math.round(b.minY / 40);
      if (rowA !== rowB) return rowA - rowB;
      return a.minX - b.minX;
    });


  console.log(
    "Detected components:",
    comps.map((c, i) => ({
      i,
      x: c.minX,
      y: c.minY,
      w: c.maxX - c.minX + 1,
      h: c.maxY - c.minY + 1,
      aspect: c.aspect.toFixed(2),
      count: c.count,
    }))
  );

  if (comps.length < 5) {
    throw new Error(`Expected ≥5 machines, found ${comps.length}`);
  }

  // If labels got glued, trim bottom ~7% (style name text under each machine)
  const pad = 4;
  const results = [];

  for (let i = 0; i < comps.length; i++) {
    const c = comps[i];
    const name = NAMES[i] || `machine-${i + 1}`;
    const labelTrim = Math.round((c.maxY - c.minY + 1) * 0.08);
    let left = Math.max(0, c.minX - pad);
    let top = Math.max(0, c.minY - pad);
    let right = Math.min(w - 1, c.maxX + pad);
    let bottom = Math.min(h - 1, c.maxY - labelTrim + pad);
    // Extra: if leftover black text pixels dominate bottom rows, trim further
    const cropW = right - left + 1;
    const cropH = bottom - top + 1;

    let rgba = await sharp(SRC)
      .extract({ left, top, width: cropW, height: cropH })
      .ensureAlpha()
      .raw()
      .toBuffer();

    rgba = Buffer.from(rgba);
    whiteToAlpha(rgba, cropW, cropH);

    // Tight trim on alpha
    let tMinX = cropW,
      tMaxX = 0,
      tMinY = cropH,
      tMaxY = 0;
    for (let y = 0; y < cropH; y++) {
      for (let x = 0; x < cropW; x++) {
        if (rgba[(y * cropW + x) * 4 + 3] > 16) {
          if (x < tMinX) tMinX = x;
          if (x > tMaxX) tMaxX = x;
          if (y < tMinY) tMinY = y;
          if (y > tMaxY) tMaxY = y;
        }
      }
    }
    if (tMaxX < tMinX) throw new Error(`Empty crop for ${name}`);

    const tw = tMaxX - tMinX + 1;
    const th = tMaxY - tMinY + 1;
    const trimmed = Buffer.alloc(tw * th * 4);
    for (let y = 0; y < th; y++) {
      for (let x = 0; x < tw; x++) {
        const si = ((tMinY + y) * cropW + (tMinX + x)) * 4;
        const di = (y * tw + x) * 4;
        trimmed[di] = rgba[si];
        trimmed[di + 1] = rgba[si + 1];
        trimmed[di + 2] = rgba[si + 2];
        trimmed[di + 3] = rgba[si + 3];
      }
    }

    const pngBuf = await sharp(trimmed, {
      raw: { width: tw, height: th, channels: 4 },
    })
      .png()
      .toBuffer();

    const pngPath = path.join(OUT, `${name}.png`);
    const svgPath = path.join(OUT, `${name}.svg`);
    fs.writeFileSync(pngPath, pngBuf);
    fs.writeFileSync(svgPath, toSvg(pngBuf, tw, th, name));
    results.push({ name, pngPath, svgPath, width: tw, height: th });
    console.log(`✓ ${name} ${tw}×${th}`);
  }

  fs.writeFileSync(
    path.join(OUT, "manifest.json"),
    JSON.stringify({ source: path.basename(SRC), machines: results }, null, 2)
  );
  console.log(`Done: ${results.length} assets → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
