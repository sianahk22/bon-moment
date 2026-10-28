import { CAP, SLOTS, label, type Quartier } from '../engine'

// Production solaire et consommation du quartier sur 24 h (repris de renderQChart dans la maquette).
export default function GraphiqueQuartier({ on, off, coord, slot }: { on: Quartier; off: Quartier; coord: boolean; slot: number }) {
  const W = 960, H = 200, pl = 40, pr = 12, pt = 14, pb = 24
  const maxY = Math.ceil(Math.max(CAP * 1.15, ...on.prod, ...off.cons, ...on.cons) / 20) * 20
  const x = (i: number) => pl + (W - pl - pr) * i / SLOTS
  const y = (v: number) => pt + (H - pt - pb) * (1 - v / maxY)
  const ligne = (arr: number[]) => arr.map((v, i) => (i ? 'L' : 'M') + x(i + .5).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ')
  const aire = `M${x(0)} ${y(0)} ` + on.prod.map((v, i) => `L${x(i + .5).toFixed(1)} ${y(v).toFixed(1)}`).join(' ') + ` L${x(SLOTS)} ${y(0)} Z`
  const nx = x(slot + .5)
  const graduations: number[] = []
  for (let v = 0; v <= maxY; v += 20) graduations.push(v)

  return (
    <svg className="graphique" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Production solaire et consommation du quartier sur 24 heures">
      {graduations.map(v => (
        <g key={v}>
          <line className="g-axe" x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} />
          <text className="g-texte" x={pl - 8} y={y(v) + 4} textAnchor="end">{v}</text>
        </g>
      ))}
      {[0, 8, 16, 24, 32, 40, 48].map(i => <text key={i} className="g-texte" x={x(i)} y={H - 6} textAnchor="middle">{label(i % SLOTS)}</text>)}
      <path className="g-production" d={aire} />
      <line className="g-capacite" x1={pl} x2={W - pr} y1={y(CAP)} y2={y(CAP)} />
      <text className="g-capacite-texte" x={W - pr - 4} y={y(CAP) - 6} textAnchor="end">Capacité du poste · {CAP} kW</text>
      <path className="g-sans" d={ligne(off.cons)} />
      <path className="g-avec" d={ligne(on.cons)} style={{ opacity: coord ? 1 : .3 }} />
      <line className="g-maintenant" x1={nx} x2={nx} y1={pt} y2={H - pb} />
    </svg>
  )
}
