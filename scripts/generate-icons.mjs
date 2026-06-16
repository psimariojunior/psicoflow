import sharp from "sharp"
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname, extname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")

// Try logo.png first, fallback to logo.jpg, logo.jpeg
let logoPath = join(root, "public", "logo.png")
if (!existsSync(logoPath)) {
  logoPath = join(root, "public", "logo.jpg")
}
if (!existsSync(logoPath)) {
  logoPath = join(root, "public", "logo.jpeg")
}

// Generate a rounded-square SVG mask (white rounded rect on transparent)
function roundedMaskSvg(size, radius) {
  return Buffer.from(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${radius}" fill="white"/>
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
    const radius = Math.round(size * 0.18)
    const iconSize = Math.round(size * 0.92) // slight inner padding

    const logoResized = await logoSquare
      .clone()
      .resize(iconSize, iconSize, { fit: "cover" })
      .png()
      .toBuffer()

    // Create a white rounded-square background, then composite the logo on top
    // This makes the icon a rounded square matching modern OS conventions
    // while keeping the EXACT same logo artwork as the site
    const bg = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      },
    })
      .composite([{ input: roundedMaskSvg(size, radius), top: 0, left: 0 }])
      .png()
      .toBuffer()

    const padding = Math.round((size - iconSize) / 2)

    await sharp(bg)
      .composite([{ input: logoResized, top: padding, left: padding }])
      .png()
      .toFile(join(root, "public", `icon-${size}.png`))

    console.log(`✓ public/icon-${size}.png generated`)
  }
}

generate().catch(console.error)
