import { mkdirSync } from 'node:fs'

import sharp from 'sharp'

// Usage: node scripts/generate-hero-images.ts <source-image>
// The source is cropped to the 4:5 portrait the hero displays, then resized per width and encoded
// as AVIF, WebP and JPEG. A tiny WebP is also written for the blur-up placeholder.
const WIDTHS = [400, 640, 880, 1200]
const ASPECT = 4 / 5
// Horizontal centre of the face in the square source, so the 4:5 crop keeps her centred.
const FOCUS_X = 0.486
const OUT_DIR = 'public/images'
const BASENAME = 'daiane-hero'

const source = process.argv[2]
if (source === undefined || source === '') {
  console.error('Usage: node scripts/generate-hero-images.ts <source-image>')
  process.exit(1)
}

const { width, height } = await sharp(source).metadata()
const cropWidth = Math.min(width, Math.round(height * ASPECT))
const cropHeight = Math.min(height, Math.round(cropWidth / ASPECT))
const left = Math.min(width - cropWidth, Math.max(0, Math.round(width * FOCUS_X - cropWidth / 2)))
const cropped = () =>
  sharp(source).rotate().extract({ left, top: 0, width: cropWidth, height: cropHeight })

mkdirSync(OUT_DIR, { recursive: true })

for (const w of WIDTHS) {
  const h = Math.round(w / ASPECT)
  const resized = () => cropped().resize(w, h, { kernel: 'lanczos3' })
  await resized().avif({ quality: 55, effort: 6 }).toFile(`${OUT_DIR}/${BASENAME}-${w}.avif`)
  await resized().webp({ quality: 78, effort: 6 }).toFile(`${OUT_DIR}/${BASENAME}-${w}.webp`)
  await resized()
    .jpeg({ quality: 78, mozjpeg: true, progressive: true })
    .toFile(`${OUT_DIR}/${BASENAME}-${w}.jpg`)
}

await cropped()
  .resize(24, 30)
  .blur(1)
  .webp({ quality: 50, effort: 6 })
  .toFile(`${OUT_DIR}/${BASENAME}-blur.webp`)

console.log(`Wrote ${BASENAME} images (${WIDTHS.join(', ')}px + blur) to ${OUT_DIR}`)
