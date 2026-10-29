import { Fragment, useState } from 'react'
import { deadlineText } from '../data/appareils'
import { SLOTS, euro, label, pct, rangeText, ranges } from '../engine'
import Icone from '../ui/Icone'
import { Gain } from './commun'
import type { EtatFoyer } from './useFoyer'

// Planning de la journée, de 8h à 8h : une ligne par appareil.
// Les zones vertes (bon moment) et rouges (à éviter) sont dessinées derrière les barres :
// on voit d'un coup d'œil que chaque appareil tombe au bon moment.
export default function PlanningJour({ foyer, maintenant }: { foyer: EtatFoyer; maintenant: number }) {
  const j = foyer.aujourdhui
  const [habitudes, setHabitudes] = useState(false)
  const [ouvert, setOuvert] = useState<number | null>(null)
  const pos = (a: number, b: number) => ({ left: `${(a / SLOTS) * 100}%`, width: `${((b - a + 1) / SLOTS) * 100}%` })
  const aEviter = ranges(j.qualites.flatMap((x, i) => (x === 'eviter' ? [i] : [])))
  const maxSun = Math.max(.001, ...j.f.solar)
  const soleil = `M0 10 ${j.f.solar.map((v, i) => `L${i + .5} ${(10 - 9.4 * v / maxSun).toFixed(2)}`).join(' ')} L${SLOTS} 10 Z`
  // Bons moments : un vert d'autant plus intense que le soleil est fort (un vert pâle la nuit, en heures creuses).
  const degrade = `linear-gradient(90deg, ${j.qualites.map((q, i) => {
    const a = q === 'bon' ? (.05 + .3 * j.f.solar[i] / maxSun).toFixed(3) : '0'
    return `rgba(29, 143, 90, ${a}) ${(i / SLOTS * 100).toFixed(3)}% ${((i + 1) / SLOTS * 100).toFixed(3)}%`
  }).join(', ')})`
  const repere = { left: `${((maintenant + .5) / SLOTS) * 100}%` }

  const Fond = () => (
    <>
      <i className="pj__zone pj__zone--degrade" style={{ background: degrade }} />
      {aEviter.map(([a, b]) => <i key={`e${a}`} className="pj__zone pj__zone--eviter" style={pos(a, b)} />)}
      <i className="pj__maintenant" style={repere} />
    </>
  )

  return (
    <div className="pj">
      {/* En-tête : soleil disponible et heures */}
      <div className="pj__ligne pj__ligne--entete" aria-hidden="true">
        <span className="pj__gauche"><span className="surtitre">Soleil du quartier</span></span>
        <div className="pj__piste pj__piste--entete">
          <svg className="pj__soleil" viewBox={`0 0 ${SLOTS} 10`} preserveAspectRatio="none"><path d={soleil} /></svg>
          {[0, 8, 16, 24, 32, 40, 48].map(i => <span key={i} className="pj__heure" style={{ left: `${(i / SLOTS) * 100}%` }}>{label(i % SLOTS)}</span>)}
          <i className="pj__maintenant" style={repere} />
        </div>
        <span className="pj__droite" />
      </div>

      {j.taches.map((t, k) => {
        const appareil = foyer.appareils.find(a => a.type === t.type)
        const gain = j.f.naive.per[k].cost - j.bilan.per[k].cost
        const fin = Math.min(t.deadline, SLOTS)
        const kwh = t.p * .5 * j.reel[k].length
        const per = j.bilan.per[k], hab = j.f.naive.per[k]
        const raisons = {
          soleil: kwh ? per.sol / kwh : 0,
          prix: kwh ? per.cost / kwh : 0, prixHab: kwh ? hab.cost / kwh : 0,
          co2: kwh ? per.co2 / kwh : 0, co2Hab: kwh ? hab.co2 / kwh : 0,
        }
        return (
          <Fragment key={t.id}>
          <div className="pj__ligne">
            <div className="pj__gauche">
              <span className={`pj__icone ${t.auto ? 'pj__icone--auto' : 'pj__icone--rappel'}`}><Icone nom={appareil?.icone ?? 'appareils'} taille={18} /></span>
              <span className="pj__nom">
                <b>{t.name}</b>
                <span className="pj__creneau chiffre">{rangeText(j.reel[k])}</span>
                <small>{deadlineText(t.deadlineH)} · {t.auto ? 'automatique' : 'rappel'}</small>
                <button type="button" className="pj__pourquoi" aria-expanded={ouvert === k} onClick={() => setOuvert(ouvert === k ? null : k)}>
                  Pourquoi ce créneau ?
                </button>
              </span>
            </div>

            <div className="pj__piste">
              <Fond />
              {habitudes && ranges(j.f.habits[k]).map(([a, b]) => <span key={`h${a}`} className="pj__habitude" style={pos(a, b)} title="Heure habituelle, sans l'application" />)}
              {ranges(j.reel[k]).map(([a, b]) => (
                <span key={`r${a}`} className={`pj__barre ${t.auto ? 'pj__barre--auto' : 'pj__barre--rappel'}`} style={pos(a, b)} title={`${t.name} : ${label(a)}–${label(b + 1)}`} />
              ))}
              <i className="pj__echeance" style={{ left: `${(fin / SLOTS) * 100}%` }} title={`Échéance : ${t.deadlineH}h`} />
            </div>

            <div className="pj__droite">
              <Gain valeur={gain} />
              <button type="button" className="pj__retirer" onClick={() => foyer.retirer(t.id)} aria-label={`Retirer : ${t.name}`} title="Retirer">
                <Icone nom="croix" taille={14} />
              </button>
            </div>
          </div>
          {ouvert === k && (
            <div className="pj__raisons" role="note">
              <span className="pj__raison pj__raison--soleil"><Icone nom="soleil" taille={16} /><b className="chiffre">{pct(raisons.soleil)}</b> de soleil du quartier</span>
              <span className="pj__raison"><Icone nom="euro" taille={16} /><b className="chiffre">{euro(raisons.prix)}/kWh</b> au lieu de {euro(raisons.prixHab)}/kWh à l'heure habituelle</span>
              <span className="pj__raison"><Icone nom="feuille" taille={16} /><b className="chiffre">{Math.round(raisons.co2)} g CO₂/kWh</b> au lieu de {Math.round(raisons.co2Hab)} g</span>
            </div>
          )}
          </Fragment>
        )
      })}

      {j.taches.length === 0 && <p className="pj__vide">Aucun besoin aujourd'hui. Ajoutez-en un ci-dessus.</p>}

      <div className="pj__pied">
        <div className="legende">
          <span className="pj__legende pj__legende--bon">Bon moment</span>
          <span className="pj__legende pj__legende--eviter">À éviter</span>
          <span className="pj__legende pj__legende--auto">Automatique</span>
          <span className="pj__legende pj__legende--rappel">Rappel</span>
        </div>
        <label className="pj__bascule">
          <input type="checkbox" checked={habitudes} onChange={e => setHabitudes(e.target.checked)} />
          Comparer à mes habitudes
        </label>
      </div>
    </div>
  )
}
