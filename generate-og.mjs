import sharp from 'sharp';

const width = 1200;
const height = 630;

const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0A1628"/>
      <stop offset="50%" style="stop-color:#0F2B5B"/>
      <stop offset="100%" style="stop-color:#1E3A8A"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3B82F6"/>
      <stop offset="100%" style="stop-color:#06B6D4"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bg)"/>

  <!-- Grid pattern -->
  <g opacity="0.05">
    ${Array.from({length: 20}, (_, i) => `<line x1="${i * 60}" y1="0" x2="${i * 60}" y2="${height}" stroke="white" stroke-width="1"/>`).join('')}
    ${Array.from({length: 11}, (_, i) => `<line x1="0" y1="${i * 60}" x2="${width}" y2="${i * 60}" stroke="white" stroke-width="1"/>`).join('')}
  </g>

  <!-- Top accent line -->
  <rect x="0" y="0" width="${width}" height="4" fill="url(#accent)"/>

  <!-- Left accent bar -->
  <rect x="80" y="160" width="5" height="120" fill="url(#accent)" rx="3"/>

  <!-- Main title: 2026 -->
  <text x="110" y="215" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="900" fill="#3B82F6">2026</text>

  <!-- Subtitle -->
  <text x="110" y="270" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="700" fill="#F1F5F9">산업안전 RBF</text>

  <!-- Description -->
  <text x="110" y="340" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="400" fill="#94A3B8">사회비용 절감 성과 대시보드</text>

  <!-- Bottom info -->
  <text x="110" y="410" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="400" fill="#64748B">50개 기업 통합 사회비용 절감액 관리 시스템</text>

  <!-- Right side: abstract chart bars -->
  <g transform="translate(750, 150)">
    <rect x="0" y="200" width="50" height="180" rx="6" fill="#3B82F6" opacity="0.3"/>
    <rect x="70" y="140" width="50" height="240" rx="6" fill="#3B82F6" opacity="0.5"/>
    <rect x="140" y="80" width="50" height="300" rx="6" fill="#3B82F6" opacity="0.7"/>
    <rect x="210" y="30" width="50" height="350" rx="6" fill="url(#accent)" opacity="0.9"/>
    <rect x="280" y="100" width="50" height="280" rx="6" fill="#06B6D4" opacity="0.6"/>
    <rect x="350" y="160" width="50" height="220" rx="6" fill="#06B6D4" opacity="0.4"/>
  </g>

  <!-- Bottom bar -->
  <rect x="0" y="${height - 60}" width="${width}" height="60" fill="rgba(0,0,0,0.3)"/>
  <text x="110" y="${height - 25}" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="500" fill="#94A3B8">knc.dreamitbiz.com</text>
  <text x="${width - 110}" y="${height - 25}" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="500" fill="#64748B" text-anchor="end">DreamIT Biz</text>
</svg>`;

await sharp(Buffer.from(svg))
  .png()
  .toFile('public/og-image.png');

console.log('OG image generated: public/og-image.png');
