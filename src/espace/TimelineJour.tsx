import { SLOTS, label, ranges } from '../engine'
import type { JourPlanifie } from './useFoyer'

// Planning d'une journée en ligne du temps horizontale, de 8h à 8h (repris du planning de la maquette).
export default function TimelineJour({ jour, maintenant }: { jour: JourPlanifie; maintenant?: number }) {
  const { f, reel, taches, qualites } = jour
  const W = 960, pl = 156, pr = 14, top = 74, rowH = 34
  const H = top + taches.length * rowH + 26
  const x = (i: number) => pl + (W - pl - pr) * i / SLOTS
  const cw = (W - pl - pr) / SLOTS
  const maxSun = Math.max(.001, ...f.solar)
  const soleil = `M${x(0)} 46 ${f.solar.map((v, i) => `L${(x(i) + cw / 2).toFixed(1)} ${(46 - 34 * v / maxSun).toFixed(1)}`).join(' ')} L${x(SLOTS)} 46 Z`

  return (
    <svg className="timeline" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Planning de la journée, de 8 heures à 8 heures le lendemain">
      <text className="t-ligne" x="0" y="34">Soleil disponible</text>
      <path className="t-soleil" d={soleil} />
      <text className="t-ligne" x="0" y={top - 10}>Bon moment ?</text>
      {qualites.map((q, i) => <rect key={i} className={`t-${q}`} x={x(i) + .5} y={top - 24} width={cw - 1} height={14} rx={2} />)}

      {taches.map((t, k) => {
        const y = top + k * rowH
        const dx = x(Math.min(t.deadline, SLOTS))
        return (
          <g key={`${t.id}-${k}`}>
            <text className="t-ligne" x="0" y={y + 21}>{t.name}</text>
            {ranges(f.habits[k]).map(([a, b]) => <rect key={`h${a}`} className="t-habitude" x={x(a) + 1} y={y + 6} width={(b - a + 1) * cw - 2} height={22} rx={5} />)}
            {ranges(reel[k]).map(([a, b], n) => <rect key={`r${n}`} className={t.auto ? 't-auto' : 't-rappel'} x={x(a) + 1} y={y + 8} width={(b - a + 1) * cw - 2} height={18} rx={5} />)}
            <line className="t-echeance" x1={dx} x2={dx} y1={y + 4} y2={y + 30} />
            <text className="t-echeance-texte" x={dx - 4} y={y + 4} textAnchor="end">{t.deadlineH}h</text>
          </g>
        )
      })}

      {maintenant !== undefined && <line className="t-maintenant" x1={x(maintenant + .5)} x2={x(maintenant + .5)} y1={8} y2={H - 22} />}
      {[0, 8, 16, 24, 32, 40, 48].map(i => <text key={i} className="t-axe" x={x(i)} y={H - 6} textAnchor="middle">{label(i % SLOTS)}</text>)}
    </svg>
  )
}
