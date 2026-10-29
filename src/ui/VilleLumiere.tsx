import { rng } from '../engine'

// Fond de l'écran d'accueil : une smart city baignée de lumière dorée.
// Tours de verre, jardins verticaux, soleil en contre-jour, pavé intelligent aux points lumineux.
// Tout est dessiné en SVG (aucune image externe) et généré avec une graine fixe : identique à chaque chargement.

const L = 1760, H = 900
const HORIZON = 640
const SOLEIL = { x: 1150, y: 470 }

interface Tour { x: number; l: number; h: number; fleche: boolean; jardin: boolean; arrondi: boolean }

function genererTours(graine: number, n: number, hMin: number, hMax: number, lMin: number, lMax: number): Tour[] {
  const r = rng(graine)
  return Array.from({ length: n }, () => ({
    x: r() * L,
    l: lMin + r() * (lMax - lMin),
    h: hMin + r() * (hMax - hMin),
    fleche: r() < .45,
    jardin: r() < .5,
    arrondi: r() < .3,
  })).sort((a, b) => b.h - a.h)
}

const LOINTAINES = genererTours(5, 26, 260, 600, 34, 80)
const PROCHES = genererTours(9, 11, 300, 560, 80, 150)

function TourVerre({ t, proche }: { t: Tour; proche: boolean }) {
  const haut = HORIZON - t.h
  const x = t.x - t.l / 2
  const lignes = Math.floor(t.l / 12)
  const r = rng(Math.round(t.x))
  return (
    <g>
      {t.fleche && <polygon points={`${t.x - 3},${haut} ${t.x},${haut - t.h * .22} ${t.x + 3},${haut}`} fill={proche ? '#8fb4cf' : 'url(#vl-brume)'} />}
      {t.arrondi
        ? <path d={`M${x} ${HORIZON} V${haut + t.l / 2} A${t.l / 2} ${t.l / 2} 0 0 1 ${x + t.l} ${haut + t.l / 2} V${HORIZON} Z`} fill={proche ? 'url(#vl-verre)' : 'url(#vl-brume)'} />
        : <polygon points={`${x},${HORIZON} ${x},${haut + 10} ${x + t.l * .5},${haut} ${x + t.l},${haut + 10} ${x + t.l},${HORIZON}`} fill={proche ? 'url(#vl-verre)' : 'url(#vl-brume)'} />}
      {proche && (
        <g>
          {Array.from({ length: lignes }, (_, c) => <line key={c} x1={x + 6 + c * 12} x2={x + 6 + c * 12} y1={haut + 16} y2={HORIZON} stroke="#ffffff" strokeOpacity=".22" />)}
          {Array.from({ length: Math.floor(t.h / 46) }, (_, e) => (
            r() < .35 ? <rect key={e} x={x + 4 + r() * (t.l - 22)} y={haut + 30 + e * 46} width="14" height="8" fill="#ffe08a" opacity=".85" /> : null
          ))}
          {/* Reflet doré côté soleil */}
          <rect x={t.x < SOLEIL.x ? x + t.l - 10 : x} y={haut + 12} width="10" height={t.h - 12} fill="#ffd27a" opacity=".45" />
        </g>
      )}
      {t.jardin && proche && (
        <g>
          {Array.from({ length: Math.floor((t.h - 60) / 96) }, (_, e) => {
            const y = haut + 70 + e * 96
            const n = Math.max(3, Math.floor(t.l / 22))
            return (
              <g key={e}>
                <rect x={x - 5} y={y} width={t.l + 10} height="6" rx="2" fill="#d9d2c4" />
                {Array.from({ length: n }, (_, c) => (
                  <circle key={c} cx={x - 2 + (c + .5) * ((t.l + 4) / n)} cy={y - 4} r={7 + ((c + e) % 3) * 2} fill={['#3f8a4e', '#5aa863', '#79bf74'][(c + e) % 3]} />
                ))}
                <path d={`M${x + 4} ${y + 6} q4 18 0 30 M${x + t.l - 6} ${y + 6} q-4 14 0 24`} stroke="#4f9a5c" strokeWidth="4" strokeLinecap="round" fill="none" />
              </g>
            )
          })}
        </g>
      )}
    </g>
  )
}

// Points lumineux du pavé intelligent (aplatis par la perspective)
function Lumieres({ cx, cy, n, rayon }: { cx: number; cy: number; n: number; rayon: number }) {
  const r = rng(Math.round(cx * 7 + cy))
  return (
    <g filter="url(#vl-lueur)">
      {Array.from({ length: n }, (_, k) => {
        const a = r() * Math.PI * 2, d = Math.sqrt(r()) * rayon
        return <ellipse key={k} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d * .32} rx={rayon / 9} ry={rayon / 26} fill="#f4f76c" />
      })}
    </g>
  )
}

function Arbre({ x, y, e = 1 }: { x: number; y: number; e?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${e})`}>
      <rect x="-24" y="-6" width="48" height="16" rx="3" fill="#9aa39b" />
      <rect x="-3" y="-60" width="6" height="56" fill="#6d5640" />
      <circle cx="0" cy="-78" r="34" fill="#4f9a5c" />
      <circle cx="-20" cy="-62" r="22" fill="#6fb873" />
      <circle cx="22" cy="-64" r="20" fill="#5aa863" />
      <circle cx="10" cy="-92" r="16" fill="#8ccf86" opacity=".8" />
    </g>
  )
}

export default function VilleLumiere({ etroit = false }: { etroit?: boolean }) {
  const pointFuite = { x: SOLEIL.x, y: HORIZON - 20 }
  const bas = [-400, -100, 200, 500, 800, 1100, 1400, 1700, 2000, 2300]
  return (
    <svg className="ville-fr" viewBox={`0 0 ${L} ${H}`} preserveAspectRatio={etroit ? 'xMidYMax slice' : 'xMaxYMax slice'} aria-hidden="true">
      <defs>
        <linearGradient id="vl-ciel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fb9e6" />
          <stop offset=".45" stopColor="#c9dcea" />
          <stop offset=".7" stopColor="#ffe2a6" />
          <stop offset="1" stopColor="#ffcf7a" />
        </linearGradient>
        <linearGradient id="vl-brume" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fb7dc" />
          <stop offset="1" stopColor="#f3d6a3" />
        </linearGradient>
        <linearGradient id="vl-verre" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f5f8c" />
          <stop offset=".5" stopColor="#6f9fc4" />
          <stop offset="1" stopColor="#e9cf9d" />
        </linearGradient>
        <linearGradient id="vl-sol" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9cf9f" />
          <stop offset=".35" stopColor="#b9a58c" />
          <stop offset="1" stopColor="#6f6c70" />
        </linearGradient>
        <radialGradient id="vl-eclat" cx={SOLEIL.x / L} cy={SOLEIL.y / H} r=".42" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor="#fffbea" stopOpacity=".95" />
          <stop offset=".1" stopColor="#ffe9a8" stopOpacity=".6" />
          <stop offset=".35" stopColor="#ffcf6b" stopOpacity=".16" />
          <stop offset="1" stopColor="#ffcf6b" stopOpacity="0" />
        </radialGradient>
        <filter id="vl-lueur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" result="flou" />
          <feMerge><feMergeNode in="flou" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width={L} height={H} fill="url(#vl-ciel)" />

      {/* Tours lointaines dans la brume dorée */}
      <g className="vf-couche vf-couche--1" opacity=".9">
        {LOINTAINES.map((t, i) => <TourVerre key={i} t={t} proche={false} />)}
      </g>

      {/* Soleil en contre-jour */}
      <g className="vf-soleil">
        <circle cx={SOLEIL.x} cy={SOLEIL.y} r="46" fill="#fffbea" />
      </g>

      {/* Tours de verre et jardins verticaux */}
      <g className="vf-couche vf-couche--2">
        {PROCHES.map((t, i) => <TourVerre key={i} t={t} proche />)}
      </g>

      {/* Éclat lumineux et rayons par-dessus les tours */}
      <g className="vf-couche vf-couche--2" style={{ mixBlendMode: 'screen' }}>
        <rect width={L} height={H} fill="url(#vl-eclat)" />
        {[-.9, -.55, -.25, .2, .5, .85].map((a, k) => (
          <polygon key={k} points={`${SOLEIL.x},${SOLEIL.y} ${SOLEIL.x + Math.cos(a + Math.PI / 2) * 1400 - 30},${SOLEIL.y + Math.sin(a + Math.PI / 2) * 1400} ${SOLEIL.x + Math.cos(a + Math.PI / 2) * 1400 + 30},${SOLEIL.y + Math.sin(a + Math.PI / 2) * 1400}`} fill="#fff4d0" opacity=".1" />
        ))}
      </g>

      {/* Oiseaux */}
      <g className="vf-couche vf-couche--3" stroke="#5b5048" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".55">
        {[[1010, 300], [1040, 280], [1072, 296], [1110, 260], [980, 330], [1140, 290], [1180, 250], [1060, 240]].map(([x, y], k) => (
          <path key={k} d={`M${x - 6} ${y} q3 -4 6 0 q3 -4 6 0`} />
        ))}
      </g>

      {/* Place pavée en perspective */}
      <g className="vf-couche vf-couche--3">
        <rect x="0" y={HORIZON - 4} width={L} height={H - HORIZON + 4} fill="url(#vl-sol)" />
        {bas.map(x => <line key={x} x1={pointFuite.x} y1={pointFuite.y} x2={x} y2={H} stroke="#ffffff" strokeOpacity=".16" />)}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(k => {
          const y = HORIZON + 6 + Math.pow(k / 7, 1.8) * (H - HORIZON)
          return <line key={k} x1="0" x2={L} y1={y} y2={y} stroke="#ffffff" strokeOpacity=".14" />
        })}
        {/* Lumière du soleil couchée sur le sol */}
        <ellipse cx={SOLEIL.x} cy={HORIZON + 40} rx="520" ry="70" fill="#ffe7a8" opacity=".5" />
      </g>

      {/* Bâtiment bas en verre, à droite, avec jardinières */}
      <g className="vf-couche vf-couche--3">
        <polygon points={`1500,${HORIZON + 10} 1500,420 1760,360 1760,${H - 40}`} fill="url(#vl-verre)" />
        {Array.from({ length: 7 }, (_, k) => <line key={k} x1="1500" x2="1760" y1={440 + k * 30} y2={380 + k * 62} stroke="#ffffff" strokeOpacity=".3" />)}
        {Array.from({ length: 6 }, (_, k) => <line key={`v${k}`} x1={1530 + k * 42} x2={1530 + k * 42} y1={414 - k * 9.7} y2={HORIZON + 14 + k * 30} stroke="#ffffff" strokeOpacity=".22" />)}
        <polygon points="1494,420 1760,356 1760,346 1494,410" fill="#d9d2c4" />
        {Array.from({ length: 6 }, (_, k) => <circle key={`p${k}`} cx={1510 + k * 46} cy={412 - k * 11} r="12" fill={['#3f8a4e', '#5aa863', '#79bf74'][k % 3]} />)}
        {/* Bordure plantée au pied du bâtiment */}
        <polygon points={`1488,${HORIZON + 4} 1500,${HORIZON + 4} 1760,${H - 40} 1760,${H - 10}`} fill="#cfc6b6" />
        {Array.from({ length: 9 }, (_, k) => <circle key={k} cx={1500 + k * 31} cy={HORIZON - 4 + k * 26} r={10 + (k % 3) * 3} fill={['#3f8a4e', '#5aa863', '#79bf74'][k % 3]} />)}
      </g>

      {/* Pavé intelligent : des points lumineux s'allument là où l'énergie du soleil circule */}
      <g className="vf-couche vf-couche--3 vf-flux">
        <Lumieres cx={SOLEIL.x - 120} cy={HORIZON + 60} n={26} rayon={70} />
        <Lumieres cx={SOLEIL.x + 210} cy={HORIZON + 140} n={30} rayon={90} />
        <Lumieres cx={SOLEIL.x - 40} cy={H - 70} n={36} rayon={120} />
        <Lumieres cx={760} cy={H - 120} n={24} rayon={90} />
      </g>

      {/* Arbres et borne de recharge */}
      <g className="vf-couche vf-couche--3">
        <Arbre x={880} y={HORIZON + 30} e={.9} />
        <Arbre x={1420} y={HORIZON + 80} e={1.15} />
        <g>
          <rect x="1300" y={HORIZON + 40} width="16" height="48" rx="5" fill="#0e3b40" />
          <rect x="1303" y={HORIZON + 48} width="10" height="10" rx="2" fill="#38d4e0" />
        </g>
      </g>
    </svg>
  )
}
