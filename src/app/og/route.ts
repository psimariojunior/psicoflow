export async function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e3a5f"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#6366F1"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#3B82F6" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" stroke-opacity="0.03" stroke-width="1"/>
  </pattern>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <circle cx="200" cy="315" r="80" fill="url(#accent)" opacity="0.15"/>
  <circle cx="200" cy="315" r="60" fill="url(#accent)"/>
  <text x="200" y="335" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="56" fill="white">&#x3A8;</text>
  <text x="320" y="290" font-family="Inter,Arial,sans-serif" font-weight="800" font-size="52" fill="white">PsiHumanis</text>
  <text x="320" y="340" font-family="Inter,Arial,sans-serif" font-weight="400" font-size="22" fill="#94a3b8">Sistema de Gest&#xE3;o para Psic&#xF3;logos</text>
  <rect x="320" y="370" width="140" height="32" rx="16" fill="#3B82F6" opacity="0.15"/>
  <text x="390" y="391" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="600" font-size="13" fill="#60a5fa">Agenda Online</text>
  <rect x="475" y="370" width="160" height="32" rx="16" fill="#3B82F6" opacity="0.15"/>
  <text x="555" y="391" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="600" font-size="13" fill="#60a5fa">Prontu&#xE1;rios</text>
  <rect x="650" y="370" width="170" height="32" rx="16" fill="#3B82F6" opacity="0.15"/>
  <text x="735" y="391" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="600" font-size="13" fill="#60a5fa">Sala Virtual</text>
  <rect x="835" y="370" width="130" height="32" rx="16" fill="#3B82F6" opacity="0.15"/>
  <text x="900" y="391" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="600" font-size="13" fill="#60a5fa">Financeiro</text>
  <rect x="0" y="580" width="1200" height="50" fill="white" opacity="0.03"/>
  <text x="600" y="612" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="400" font-size="14" fill="#475569">psihumanis.com.br</text>
</svg>`

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  })
}
