import { lazy, Suspense, useEffect } from 'react'
import { SLOTS, kw, label, pct } from '../engine'
import { Pastille } from '../ui/composants'
import Icone from '../ui/Icone'
import { useSimulation } from '../ui/simulation'
import GraphiqueQuartier from './GraphiqueQuartier'

// three.js n'est téléchargé que lorsque cette vue s'affiche.
const Scene3D = lazy(() => import('./Scene3D'))

// Tableau de bord Ville : la 3D au centre, les panneaux flottants autour.
export default function VueVille() {
  const s = useSimulation()
  const { setLecture } = s
  // En quittant la vue Ville, on met la lecture de la journée en pause.
  useEffect(() => () => setLecture(false), [setLecture])
  const { on, off } = s.q
  const q = s.coord ? on : off
  const prod = q.prod[s.slot], cons = q.cons[s.slot], local = Math.min(prod, cons)

  return (
    <div className="ville">
      <div className="ville__scene">
        <Suspense fallback={<div className="scene__secours">Chargement du quartier en 3D…</div>}>
          <Scene3D q={q} slot={s.slot} scenario={s.scenario} cloud={s.cloud} />
        </Suspense>

        <div className="hud" aria-live="polite">
          <span className="hud__heure chiffre">{label(s.slot)}</span>
          <span><Icone nom="soleil" taille={14} />Soleil <b className="chiffre soleil">{kw(prod)}</b></span>
          <span><Icone nom="eclair" taille={14} />Conso <b className="chiffre">{kw(cons)}</b></span>
          <span>Part locale <b className="chiffre soleil">{cons ? pct(local / cons) : '–'}</b></span>
          <span><Icone nom="reseau" taille={14} />Réseau <b className="chiffre reseau">{kw(cons - local)}</b></span>
        </div>
      </div>

      <aside className="ville__commandes panneau panneau--flottant" aria-label="Commandes de la simulation">
        <div>
          <p className="surtitre">Heure simulée</p>
          <div className="horloge">
            <span className="horloge__valeur chiffre">{label(s.slot)}</span>
            <button type="button" className="btn btn--contour" aria-pressed={s.lecture} onClick={() => s.setLecture(!s.lecture)}>
              {s.lecture ? 'Pause' : 'Lecture'}
            </button>
          </div>
          <input
            className="curseur" type="range" min={0} max={SLOTS - 1} step={1} value={s.slot}
            aria-label="Heure de la journée" onChange={e => s.setSlot(Number(e.target.value))}
          />
        </div>

        <label className="interrupteur">
          <span><b>Coordination Le Bon Moment</b><small>Planifie les tâches de tous les voisins ensemble</small></span>
          <input type="checkbox" checked={s.coord} onChange={e => s.setCoord(e.target.checked)} />
        </label>

        <button type="button" className="btn btn--soleil" aria-pressed={s.cloud} onClick={() => s.setCloud(!s.cloud)}>
          <Icone nom="nuage" taille={18} />
          {s.cloud ? 'Retirer le nuage' : 'Un nuage arrive (11h30–15h30)'}
        </button>

        <div>
          <p className="surtitre">Sur la journée · sans / avec</p>
          <div className="comparaison">
            <Comparaison libelle="Soleil consommé sur place" sans={pct(off.taux)} avec={pct(on.taux)} />
            <Comparaison libelle="Pic sur le poste électrique" sans={kw(off.peak)} avec={kw(on.peak)} />
          </div>
        </div>
      </aside>

      <section className="ville__graphique panneau panneau--flottant" aria-label="Production et consommation du quartier">
        <div className="panneau__tete">
          <h2 className="panneau__titre">Production et consommation du quartier, de 8h à 8h</h2>
          <div className="legende">
            <Pastille ton="soleil">Production solaire</Pastille>
            <Pastille ton="reseau">Avec Le Bon Moment</Pastille>
            <Pastille ton="neutre">Sans coordination</Pastille>
            <Pastille ton="eviter">Capacité du poste</Pastille>
          </div>
        </div>
        <GraphiqueQuartier on={on} off={off} coord={s.coord} slot={s.slot} />
      </section>
    </div>
  )
}

function Comparaison({ libelle, sans, avec }: { libelle: string; sans: string; avec: string }) {
  return (
    <div className="comparaison__ligne">
      <span className="comparaison__libelle">{libelle}</span>
      <span className="comparaison__sans chiffre">{sans}</span>
      <Icone nom="fleche" taille={14} />
      <span className="comparaison__avec chiffre">{avec}</span>
    </div>
  )
}
