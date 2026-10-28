import { useState } from 'react'
import { CALENDRIER, JOURS_HISTORIQUE, historiqueQuartier } from '../data/demo'
import { CAP, euro, kw, pct } from '../engine'
import { GraphiqueJours, kg, nombre } from '../espace/commun'
import { Kpi, Panneau } from '../ui/composants'
import { useSimulation } from '../ui/simulation'

const PERIODES = [7, 30, 60]

export default function EcranVilleBilan() {
  const s = useSimulation()
  const { on, off } = s.q
  const [periode, setPeriode] = useState(30)
  const jours = historiqueQuartier().slice(-periode)
  const cal = CALENDRIER.slice(JOURS_HISTORIQUE - periode, JOURS_HISTORIQUE)
  const etiquettes = cal.map(c => `${c.date.getDate()}/${c.date.getMonth() + 1}`)
  const somme = (f: (j: typeof jours[0]) => number) => jours.reduce((t, j) => t + f(j), 0)

  const lignes: [string, string, string][] = [
    ['Production solaire', `${nombre(on.P)} kWh`, `${nombre(on.P)} kWh`],
    ['Soleil consommé sur place', `${nombre(off.local)} kWh`, `${nombre(on.local)} kWh`],
    ['Taux d\'autoconsommation', pct(off.taux), pct(on.taux)],
    ['Pic sur le poste électrique', kw(off.peak), kw(on.peak)],
    ['Facture du quartier', euro(off.cost), euro(on.cost)],
    ['CO₂ émis', kg(off.co2 / 1000), kg(on.co2 / 1000)],
  ]

  return (
    <div className="ecran">
      <div className="ecran__colonnes">
        <Panneau titre="Bilan de la journée simulée" icone="bilan" action={<span className="texte-2" style={{ fontSize: 12 }}>sans / avec Le Bon Moment</span>}>
          <div className="tableau-bilan" role="table" aria-label="Bilan de la journée sans et avec coordination">
            <div className="tableau-bilan__ligne tableau-bilan__entete" role="row"><span role="columnheader" /><span role="columnheader">Sans</span><span role="columnheader">Avec</span></div>
            {lignes.map(([l, sans, avec]) => (
              <div key={l} className="tableau-bilan__ligne" role="row">
                <span role="cell">{l}</span><span role="cell" className="chiffre texte-2">{sans}</span><span role="cell" className="chiffre bon">{avec}</span>
              </div>
            ))}
          </div>
        </Panneau>
        <div className="ecran__kpis ecran__kpis--2">
          <Panneau><Kpi libelle="Autoconsommation" valeur={pct(on.taux)} ton="bon" note={`contre ${pct(off.taux)} sans coordination`} /></Panneau>
          <Panneau><Kpi libelle="Pic sur le poste" valeur={kw(on.peak).replace(' kW', '')} unite="kW" ton="reseau" note={`contre ${kw(off.peak)} · capacité ${CAP} kW`} /></Panneau>
          <Panneau><Kpi libelle="Économies du quartier" valeur={euro(off.cost - on.cost)} ton="bon" note="sur cette journée" /></Panneau>
          <Panneau><Kpi libelle="CO₂ évité" valeur={kg((off.co2 - on.co2) / 1000)} note="sur cette journée" /></Panneau>
        </div>
      </div>

      <div className="ecran__barre">
        <div className="segments" role="group" aria-label="Période">
          {PERIODES.map(p => <button key={p} type="button" aria-pressed={p === periode} onClick={() => setPeriode(p)}>{p} jours</button>)}
        </div>
        <p className="texte-2">
          Données de démonstration · sur {periode} jours : <b className="chiffre bon">{euro(somme(j => j.economie))}</b> économisés,{' '}
          <b className="chiffre">{kg(somme(j => j.co2))}</b> de CO₂ évités, <b className="chiffre">{somme(j => (j.pic > CAP ? 1 : 0))}</b> jour(s) au-dessus de la capacité du poste
          (contre <b className="chiffre">{somme(j => (j.picSans > CAP ? 1 : 0))}</b> sans coordination)
        </p>
      </div>

      <div className="ecran__graphiques">
        <Panneau titre="Économies du quartier par jour" icone="euro">
          <GraphiqueJours valeurs={jours.map(j => j.economie)} etiquettes={etiquettes} ton="bon" format={v => nombre(v) + ' €'} />
        </Panneau>
        <Panneau titre="Soleil consommé sur place" icone="soleil" action={<span className="reference-legende"><i aria-hidden="true" />Sans coordination</span>}>
          <GraphiqueJours type="ligne" valeurs={jours.map(j => j.taux)} etiquettes={etiquettes} ton="soleil" format={v => pct(v)} reference={jours.map(j => j.tauxSans)} />
        </Panneau>
        <Panneau titre="Pic sur le poste électrique" icone="reseau" action={<span className="reference-legende"><i aria-hidden="true" />Capacité {CAP} kW</span>}>
          <GraphiqueJours valeurs={jours.map(j => j.pic)} etiquettes={etiquettes} ton="reseau" format={v => nombre(v) + ' kW'} reference={CAP} />
        </Panneau>
      </div>
    </div>
  )
}
