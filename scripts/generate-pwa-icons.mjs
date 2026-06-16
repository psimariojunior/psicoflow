import sharp from 'sharp'
import path from 'path'

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const OUT_DIR = 'public'
const LOGO_PATH = path.join(OUT_DIR, 'logo.png')
const GREEN = { r: 16, g: 185, b: 129, alpha: 1 }
const VERSION = 'v3'

async function main() {
  // Load logo and convert to a clean square crop first
  const logoMeta = await sharp(LOGO_PATH).metadata()
  const size = Math.min(logoMeta.width || 1000, logoMeta.height || 1000)
  
  // Center-crop the logo to square first
  const squareLogo = await sharp(LOGO_PATH)
    .resize(800, 800, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  for (const iconSize of SIZES) {
    // Green background
    const bg = await sharp({
      create: { width: iconSize, height: iconSize, channels: 4, background: GREEN },
    }).png().toBuffer()

    // Logo inside with comfortable padding
    const padLogo = Math.round(iconSize * 0.18)
    const logoInner = iconSize - padLogo * 2

    const logoResized = await sharp(squareLogo)
      .resize(logoInner, logoInner)
      .png()
      .toBuffer()

    await sharp(bg)
      .composite([{ input: logoResized, top: padLogo, left: padLogo }])
      .png()
      .toFile(path.join(OUT_DIR, `pwa-${iconSize}-${VERSION}.png`))

    // Maskable
    const padMask = Math.round(iconSize * 0.22)
    const maskInner = iconSize - padMask * 2
    const logoMasked = await sharp(squareLogo)
      .resize(maskInner, maskInner)
      .png()
      .toBuffer()

    await sharp(bg)
      .composite([{ input: logoMasked, top: padMask, left: padMask }])
      .png()
      .toFile(path.join(OUT_DIR, `pwa-${iconSize}-${VERSION}-maskable.png`))

    console.log(`Generated ${iconSize}x${iconSize}`)
  }
  
  // Clean up old-style icons  
  for (const iconSize of SIZES) {
    const fs = await import('fs')
    for (const name of [`icon-${iconSize}.png`, `icon-${iconSize}-maskable.png`]) {
      try { fs.unlinkSync(path.join(OUT_DIR, name)) } catch {}
    }
  }
  console.log('Cleaned up old icons')
}

main().catch(console.error)
