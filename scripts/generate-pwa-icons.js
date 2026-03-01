/**
 * Génère les icônes PWA placeholder (192x192 et 512x512).
 * À remplacer par vos vrais logos si besoin.
 */
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const dir = path.join(__dirname, "..", "public", "icons");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const themeColor = { r: 249, g: 115, b: 22 }; // #f97316

async function generate() {
  await sharp({
    create: { width: 192, height: 192, channels: 3, background: themeColor },
  })
    .png()
    .toFile(path.join(dir, "icon-192.png"));
  await sharp({
    create: { width: 512, height: 512, channels: 3, background: themeColor },
  })
    .png()
    .toFile(path.join(dir, "icon-512.png"));
  console.log("Icônes PWA générées dans public/icons/");
}

generate().catch((e) => {
  console.error(e);
  process.exit(1);
});
