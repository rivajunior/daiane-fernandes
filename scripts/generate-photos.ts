import { mkdirSync } from 'node:fs'

import sharp from 'sharp'

// Usage: node scripts/generate-photos.ts <hero|about> <source-image>
// The source is cropped to the shape the page displays, then resized per width and encoded as AVIF,
// WebP and JPEG. The hero also gets a tiny WebP for its blur-up placeholder.
const PRESETS = {
  hero: {
    basename: 'daiane-hero',
    widths: [400, 640, 880, 1200],
    aspect: 4 / 5,
    // Horizontal center of the face in the square source, so the crop keeps her centered.
    focusX: 0.486,
    blur: true,
  },
  about: {
    basename: 'daiane-about',
    widths: [400, 640],
    aspect: 640 / 700,
    focusX: 0.5,
    blur: false,
  },
} as const

const OUT_DIR = 'public/images'

const [name, source] = process.argv.slice(2)
if ((name !== 'hero' && name !== 'about') || source === undefined || source === '') {
  console.error('Usage: node scripts/generate-photos.ts <hero|about> <source-image>')
  process.exit(1)
}

const { basename, widths, aspect, focusX, blur } = PRESETS[name]
const { width, height } = await sharp(source).metadata()
const cropWidth = Math.min(width, Math.round(height * aspect))
const cropHeight = Math.min(height, Math.round(cropWidth / aspect))
const left = Math.min(width - cropWidth, Math.max(0, Math.round(width * focusX - cropWidth / 2)))
const cropped = () =>
  sharp(source).rotate().extract({ left, top: 0, width: cropWidth, height: cropHeight })

mkdirSync(OUT_DIR, { recursive: true })

for (const w of widths) {
  const h = Math.round(w / aspect)
  const resized = () => cropped().resize(w, h, { kernel: 'lanczos3' })
  await resized().avif({ quality: 55, effort: 6 }).toFile(`${OUT_DIR}/${basename}-${w}.avif`)
  await resized().webp({ quality: 78, effort: 6 }).toFile(`${OUT_DIR}/${basename}-${w}.webp`)
  await resized()
    .jpeg({ quality: 78, mozjpeg: true, progressive: true })
    .toFile(`${OUT_DIR}/${basename}-${w}.jpg`)
}

if (blur) {
  await cropped()
    .resize(24, 30)
    .blur(1)
    .webp({ quality: 50, effort: 6 })
    .toFile(`${OUT_DIR}/${basename}-blur.webp`)
}

console.log(`Wrote ${basename} images (${widths.join(', ')}px) to ${OUT_DIR}`)
