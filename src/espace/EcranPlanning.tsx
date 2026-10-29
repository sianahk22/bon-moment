import { useState } from 'react'
import { DEADLINES, DEVICES, deadlineText, type DeviceId } from '../data/appareils'
import { euro, pct } from '../engine'
import { Kpi, Panneau } from '../ui/composants'
import Icone from '../ui/Icone'
import { useSimulation } from '../ui/simulation'
import CalendrierSemaine from './CalendrierSemaine'
import { kg } from './commun'
import PlanningJour from './PlanningJour'
import type { EtatFoyer } from './useFoyer'

export default function EcranPlanning({ foyer }: { foyer: EtatFoyer }) {
  const sim = useSimulation()
  const j = foyer.aujourdhui
  const types = foyer.u.types.filter(t => foyer.appareils.some(a => a.type === t)) as DeviceId[]
  const [type, setType] = useState<DeviceId>(types.includes('voiture') ? 'voiture' : types[0])
  const [echeance, setEcheance] = useState(7)

  const economie = j.f.naive.cost - j.bilan.cost
  const co2 = (j.f.naive.co2 - j.bilan.co2) / 1000
  const part = j.bilan.kwh ? j.bilan.sol / j.bilan.kwh : 0
  const tenues = j.taches.filter((t, k) => j.reel[k].length === t.dur && Math.max(...j.reel[k]) < t.deadline).length

  return (
    <div className="ecran">
      <div className="ecran__kpis">
        <Panneau><Kpi icone="euro" libelle="Économie du jour" valeur={euro(Math.max(0, economie))} ton="bon" note={`${euro(j.bilan.cost)} au lieu de ${euro(j.f.naive.cost)}`}
          extra={`≈ ${euro(foyer.economieAnnuelle)} sur un an`} /></Panneau>
        <Panneau><Kpi icone="feuille" libelle="CO₂ évité" valeur={kg(Math.max(0, co2))} note="par rapport à vos habitudes" /></Panneau>
        <Panneau><Kpi icone="soleil" libelle="Soleil du quartier" valeur={pct(part)} ton="soleil" note="de l'énergie de vos appareils pilotés" /></Panneau>
        <Panneau><Kpi icone="coche" libelle="Échéances tenues" valeur={`${tenues} / ${j.taches.length}`} note={tenues === j.taches.length ? 'tout est prêt à l\'heure' : 'une échéance est trop courte'} /></Panneau>
      </div>

      <Panneau titre="Ma journée, de 8h à 8h" icone="planning" action={
        <form className="ajout-rapide" onSubmit={e => { e.preventDefault(); foyer.ajouter(type, echeance) }}>
          <select aria-label="Appareil" value={type} onChange={e => setType(e.target.value as DeviceId)}>
            {types.map(k => <option key={k} value={k}>{DEVICES[k].name}</option>)}
          </select>
          <select aria-label="Échéance" value={echeance} onChange={e => setEcheance(Number(e.target.value))}>
            {DEADLINES.map(h => <option key={h} value={h}>{deadlineText(h)}</option>)}
          </select>
          <button type="submit" className="btn btn--plein"><Icone nom="planning" taille={16} />Ajouter un besoin</button>
        </form>
      }>
        <PlanningJour foyer={foyer} maintenant={sim.slot} />
      </Panneau>

      <Panneau titre="Cette semaine" icone="planning" action={<span className="texte-2" style={{ fontSize: 12.5 }}>Touchez un appareil pour valider ou changer son créneau</span>}>
        <CalendrierSemaine foyer={foyer} />
      </Panneau>
    </div>
  )
}
