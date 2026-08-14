import sharp from "sharp";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const source = join(publicDir, "assets", "pwa-icon-source.png");
const brown = { r: 0x6b, g: 0x44, b: 0x23, alpha: 1 };

/** Squircle / iOS-like rounded mask (~22% corner radius). */
function roundedMask(size) {
  const r = Math.round(size * 0.22);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="#fff"/>
    </svg>`;
  return Buffer.from(svg);
}

async function writeIcon(size, filename) {
  const square = await sharp(source)
    .resize(size, size, { fit: "cover", position: "centre", background: brown })
    .flatten({ background: brown })
    .png()
    .toBuffer();

  await sharp(square)
    .composite([
      {
        input: roundedMask(size),
        blend: "dest-in",
      },
    ])
    .png()
    .toFile(join(publicDir, filename));
}

await writeIcon(192, "icon-192.png");
await writeIcon(512, "icon-512.png");
await writeIcon(180, "apple-touch-icon.png");

console.log("PWA icons written with rounded corners (192, 512, apple-touch 180)");
