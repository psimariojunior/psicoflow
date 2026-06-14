import sharp from "sharp"
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")

const logoPath = join(root, "public", "logo.png")

// SVG template for the green rounded background
function bgSvg(size) {
  const radius = Math.round(size * 0.2)
  return Buffer.from(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#10b981"/>
          <stop offset="100%" stop-color="#047857"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${radius}" fill="url(#g)"/>
    </svg>
  `)
}

async function generate() {
  const logo = sharp(logoPath)
  const meta = await logo.metadata()
  
  // Center crop logo to square
  const cropSize = Math.min(meta.width, meta.height)
  const left = Math.round((meta.width - cropSize) / 2)
  const top = Math.round((meta.height - cropSize) / 2)
  const logoSquare = sharp(logoPath).extract({ left, top, width: cropSize, height: cropSize })

  for (const size of [512, 192]) {
    const padding = Math.round(size * 0.15)
    const logoInnerSize = size - padding * 2

    const logoResized = await logoSquare
      .clone()
      .resize(logoInnerSize, logoInnerSize, { fit: "cover" })
      .png()
      .toBuffer()

    await sharp(bgSvg(size))
      .resize(size, size)
      .composite([{ input: logoResized, top: padding, left: padding }])
      .png()
      .toFile(join(root, "public", `icon-${size}.png`))

    console.log(`✓ public/icon-${size}.png generated`)
  }
}

generate().catch(console.error)
