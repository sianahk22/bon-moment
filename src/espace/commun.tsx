import type { Statut, Tempo } from '../data/demo'
import { euro } from '../engine'
import Icone from '../ui/Icone'

// Petits éléments partagés par les écrans Particulier et Entreprise.

export const kg = (v: number) => v.toFixed(1).replace('.', ',') + ' kg'
export const nombre = (v: number, dec = 0) => v.toFixed(dec).replace('.', ',')

export function TempoPuce({ tempo, nuage }: { tempo: Tempo; nuage?: boolean }) {
  return (
    <span className={`tempo tempo--${tempo}`}>
      Jour {tempo}{nuage && <Icone nom="nuage" taille={12} />}
    </span>
  )
}

const TEXTE_STATUT: Record<Statut, string> = { accepte: 'Suivi', decale: 'Décalé', ignore: 'Ignoré' }
export function StatutPuce({ statut }: { statut: Statut }) {
  return <span className={`statut statut--${statut}`}>{TEXTE_STATUT[statut]}</span>
}

export function ModePuce({ auto }: { auto: boolean }) {
  return <span className={`mode ${auto ? 'mode--auto' : 'mode--rappel'}`}>{auto ? 'Automatique' : 'Rappel'}</span>
}

// Graphique jour par jour (barres ou ligne), avec une référence en pointillés (moyenne du quartier, abonnement…).
export function GraphiqueJours({ valeurs, etiquettes, type = 'barres', ton, reference, format }: {
  valeurs: number[]
  etiquettes: string[]
  type?: 'barres' | 'ligne'
  ton: 'soleil' | 'reseau' | 'bon'
  reference?: number[] | number
  format: (v: number) => string
}) {
  const W = 640, H = 210, pl = 46, pr = 8, pt = 12, pb = 22
  const refs = reference === undefined ? [] : Array.isArray(reference) ? reference : valeurs.map(() => reference)
  const max = Math.max(.001, ...valeurs, ...refs) * 1.1
  const n = valeurs.length
  const x = (i: number) => pl + (W - pl - pr) * (i + .5) / n
  const y = (v: number) => pt + (H - pt - pb) * (1 - v / max)
  const bw = Math.max(2, (W - pl - pr) / n - 3)
  const pas = Math.ceil(n / 7)
  const ligne = (arr: number[]) => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')

  return (
    <svg className="graphique-jours" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${format(valeurs.reduce((a, b) => a + b, 0))} sur ${n} jours`}>
      {[0, .5, 1].map(f => (
        <g key={f}>
          <line className="g-axe" x1={pl} x2={W - pr} y1={y(max / 1.1 * f)} y2={y(max / 1.1 * f)} />
          <text className="g-texte" x={pl - 6} y={y(max / 1.1 * f) + 4} textAnchor="end">{format(max / 1.1 * f)}</text>
        </g>
      ))}
      {type === 'barres'
        ? valeurs.map((v, i) => <rect key={i} className={`gj-barre gj--${ton}`} x={x(i) - bw / 2} y={y(Math.max(0, v))} width={bw} height={Math.max(0, y(0) - y(Math.max(0, v)))} rx={Math.min(3, bw / 3)}><title>{`${etiquettes[i]} : ${format(v)}`}</title></rect>)
        : <path className={`gj-ligne gj--${ton}`} d={ligne(valeurs)} />}
      {refs.length > 0 && <path className="gj-reference" d={ligne(refs)} />}
      {etiquettes.map((e, i) => (i % pas === 0 ? <text key={i} className="g-texte" x={x(i)} y={H - 6} textAnchor="middle">{e}</text> : null))}
    </svg>
  )
}

// Gain d'un moment par rapport à l'habitude : « −0,42 € » en vert, surcoût en rouge, « ≈ 0 € » si négligeable.
export function Gain({ valeur }: { valeur: number }) {
  if (Math.abs(valeur) < .005) return <span className="chiffre gain gain--nul">≈ 0 €</span>
  return <span className={`chiffre gain ${valeur > 0 ? 'bon' : 'eviter'}`}>{valeur > 0 ? '−' : '+'}{euro(Math.abs(valeur))}</span>
}
