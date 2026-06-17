import sharp from "sharp"

const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#10b981"/>
  <text x="600" y="280" font-family="sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">PsicoFlow</text>
  <text x="600" y="350" font-family="sans-serif" font-size="28" fill="rgba(255,255,255,0.85)" text-anchor="middle">Gestão Inteligente para Psicólogos</text>
  <text x="600" y="420" font-family="sans-serif" font-size="18" fill="rgba(255,255,255,0.65)" text-anchor="middle">Agenda Online · Prontuários · Sala Virtual · Finanças</text>
</svg>`

sharp(Buffer.from(svg)).png().toFile("public/og-image.png").then(() => console.log("OK"))
