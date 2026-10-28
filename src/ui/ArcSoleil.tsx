import { useId } from 'react'
import { SLOTS, label, type Qualite } from '../engine'

// Signature visuelle : la journée de 8 h à 8 h dessinée comme un arc.
// - arc extérieur ambre : le soleil du quartier (plus il est épais et lumineux, plus il produit) ;
// - pastilles intérieures : bon moment (vert), neutre, à éviter (rouge) ;
// - le soleil et l'aiguille : l'heure affichée.

interface Props {
  soleil: number[] // 48 valeurs entre 0 et 1
  qualites: Qualite[] // 48 valeurs
  maintenant?: number // indice du créneau affiché
  titre?: string
  legende?: string
  description: string // texte lu par les lecteurs d'écran
}

const CX = 320, CY = 318, R = 270, R_IN = 228

function pos(t: number, r: number): [number, number] {
  const a = Math.PI * (1 - t)
  return [CX + r * Math.cos(a), CY - r * Math.sin(a)]
}

const COULEUR: Record<Qualite, string> = { bon: 'var(--bon)', neutre: 'var(--neutre-point)', eviter: 'var(--eviter)' }

export default function ArcSoleil({ soleil, qualites, maintenant, titre, legende, description }: Props) {
  const id = useId().replace(/:/g, '')
  const fmt = (n: number) => n.toFixed(1)

  const segments = soleil.map((s, i) => {
    if (s < 0.02) return null
    const [x0, y0] = pos(i / SLOTS, R), [x1, y1] = pos((i + 1) / SLOTS, R)
    return (
      <path
        key={i}
        d={`M${fmt(x0)} ${fmt(y0)} A${R} ${R} 0 0 1 ${fmt(x1)} ${fmt(y1)}`}
        stroke="var(--soleil)"
        strokeWidth={3 + 16 * s}
        strokeOpacity={0.22 + 0.78 * s}
      />
    )
  })

  const reperes = [0, 12, 24, 36, 48].map(i => {
    const [x, y] = pos(i / SLOTS, R + 30)
    return <text key={i} x={fmt(x)} y={fmt(y + 4)} textAnchor="middle" className="arc__repere">{label(i % SLOTS)}</text>
  })

  const marqueur = maintenant !== undefined ? (() => {
    const t = (maintenant + 0.5) / SLOTS
    const [x, y] = pos(t, R)
    const [xi, yi] = pos(t, R_IN - 16)
    const jour = soleil[maintenant] > 0.02
    return (
      <g className="arc__marqueur">
        <line x1={CX} y1={CY} x2={fmt(xi)} y2={fmt(yi)} stroke="var(--trait-fort)" strokeWidth="1" strokeDasharray="2 5" />
        <circle cx={fmt(x)} cy={fmt(y)} r="24" fill={jour ? 'var(--soleil)' : 'var(--reseau)'} opacity=".35" filter={`url(#lueur-${id})`} />
        <circle cx={fmt(x)} cy={fmt(y)} r="13" fill="var(--nuit-0)" stroke={jour ? 'var(--soleil)' : 'var(--reseau)'} strokeWidth="2.5" />
        <circle cx={fmt(x)} cy={fmt(y)} r="5.5" fill={jour ? '#fff3d6' : 'var(--reseau)'} />
      </g>
    )
  })() : null

  return (
    <svg className="arc" viewBox="0 0 640 336" role="img" aria-label={description}>
      <defs>
        <filter id={`lueur-${id}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <line x1="10" x2="630" y1={CY} y2={CY} stroke="var(--trait)" strokeWidth="1" />
      <path className="arc__piste" d={`M${CX - R} ${CY} A${R} ${R} 0 0 1 ${CX + R} ${CY}`} stroke="var(--trait-fort)" strokeWidth="1.2" fill="none" pathLength={1} />

      <g className="arc__soleil" fill="none" strokeLinecap="butt">{segments}</g>

      <g className="arc__moments">
        {qualites.map((q, i) => {
          const [x, y] = pos((i + 0.5) / SLOTS, R_IN)
          return <circle key={i} cx={fmt(x)} cy={fmt(y)} r={q === 'neutre' ? 3 : 4.4} fill={COULEUR[q]} style={{ animationDelay: `${300 + i * 14}ms` }} />
        })}
      </g>

      {reperes}
      {marqueur}

      {titre && <text x={CX} y={CY - 66} textAnchor="middle" className="arc__titre">{titre}</text>}
      {legende && <text x={CX} y={CY - 32} textAnchor="middle" className="arc__legende">{legende}</text>}
    </svg>
  )
}
