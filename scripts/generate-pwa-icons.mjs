// Rasterizes public/icon-source.svg into the PNG sizes the PWA manifest and
// iOS home-screen icon need. Re-run with `node scripts/generate-pwa-icons.mjs`
// whenever icon-source.svg changes.
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')
const source = path.join(publicDir, 'icon-source.svg')

const targets = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'icon-maskable-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
]

for (const { file, size } of targets) {
  await sharp(source, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(path.join(publicDir, file))
  console.log(`✓ ${file} (${size}x${size})`)
}
