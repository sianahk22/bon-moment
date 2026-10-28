import { useState } from 'react'
import { DEADLINES, DEVICES, deadlineText, type DeviceId } from '../data/appareils'
import { euro, pct, rangeText } from '../engine'
import { Kpi, Panneau, Pastille } from '../ui/composants'
import Icone from '../ui/Icone'
import { useSimulation } from '../ui/simulation'
import CalendrierSemaine from './CalendrierSemaine'
import { Gain, ModePuce, kg } from './commun'
import TimelineJour from './TimelineJour'
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
        <Panneau><Kpi libelle="Économie du jour" valeur={euro(Math.max(0, economie))} ton="bon" note={`${euro(j.bilan.cost)} au lieu de ${euro(j.f.naive.cost)}`} /></Panneau>
        <Panneau><Kpi libelle="CO₂ évité" valeur={kg(Math.max(0, co2))} note="par rapport à vos habitudes" /></Panneau>
        <Panneau><Kpi libelle="Soleil du quartier" valeur={pct(part)} ton="soleil" note="de l'énergie de vos appareils pilotés" /></Panneau>
        <Panneau><Kpi libelle="Échéances tenues" valeur={`${tenues} / ${j.taches.length}`} note={tenues === j.taches.length ? 'tout est prêt à l\'heure' : 'une échéance est trop courte'} /></Panneau>
      </div>

      <div className="ecran__principal">
        <Panneau titre="Aujourd'hui, de 8h à 8h" icone="planning" action={
          <div className="legende">
            <Pastille ton="bon">Bon moment</Pastille><Pastille ton="eviter">À éviter</Pastille>
            <Pastille ton="reseau">Automatique</Pastille><Pastille ton="soleil">Rappel</Pastille>
            <Pastille ton="neutre">Habitude sans l'app</Pastille>
          </div>
        }>
          <TimelineJour jour={j} maintenant={sim.slot} />
        </Panneau>

        <Panneau titre="Mes besoins" icone="moments">
          <ul className="besoins">
            {j.taches.map((t, k) => {
              const gain = j.f.naive.per[k].cost - j.bilan.per[k].cost
              return (
                <li key={t.id} className="besoin">
                  <span className="besoin__icone"><Icone nom={(foyer.appareils.find(a => a.type === t.type)?.icone) ?? 'appareils'} taille={18} /></span>
                  <span className="besoin__texte">
                    <b>{t.name}</b>
                    <small>{deadlineText(t.deadlineH)} · {t.detail}</small>
                    <span className="chiffre besoin__creneau">{rangeText(j.reel[k])}</span>
                  </span>
                  <span className="besoin__cote">
                    <ModePuce auto={t.auto} />
                    <Gain valeur={gain} />
                    <button type="button" className="lien" onClick={() => foyer.retirer(t.id)}>Retirer</button>
                  </span>
                </li>
              )
            })}
          </ul>
          <form className="ajout" onSubmit={e => { e.preventDefault(); foyer.ajouter(type, echeance) }}>
            <p className="surtitre">Ajouter un besoin</p>
            <div className="ajout__champs">
              <select aria-label="Appareil" value={type} onChange={e => setType(e.target.value as DeviceId)}>
                {types.map(k => <option key={k} value={k}>{DEVICES[k].name}</option>)}
              </select>
              <select aria-label="Échéance" value={echeance} onChange={e => setEcheance(Number(e.target.value))}>
                {DEADLINES.map(h => <option key={h} value={h}>{deadlineText(h)}</option>)}
              </select>
              <button type="submit" className="btn btn--plein">Ajouter</button>
            </div>
          </form>
        </Panneau>
      </div>

      <Panneau titre="Cette semaine" icone="planning" action={
        <div className="legende">
          <Pastille ton="reseau">Automatique</Pastille><Pastille ton="soleil">Rappel</Pastille>
          <span className="texte-2" style={{ fontSize: 12 }}>Cliquez un créneau pour le valider ou le déplacer</span>
        </div>
      }>
        <CalendrierSemaine foyer={foyer} />
      </Panneau>
    </div>
  )
}
