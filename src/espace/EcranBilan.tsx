import { useState } from 'react'
import { ABONNEMENT_LILY_KVA } from '../data/demo'
import { euro, pct } from '../engine'
import { Kpi, Panneau } from '../ui/composants'
import { GraphiqueJours, kg, nombre } from './commun'
import type { EtatFoyer } from './useFoyer'

const PERIODES = [7, 30, 60]

export default function EcranBilan({ foyer, entreprise }: { foyer: EtatFoyer; entreprise: boolean }) {
  const [periode, setPeriode] = useState(30)
  const jours = foyer.historique.jours.slice(-periode)
  const quartier = foyer.quartier.slice(-periode)
  const etiquettes = jours.map(j => `${j.cal.date.getDate()}/${j.cal.date.getMonth() + 1}`)
  const somme = (f: (j: typeof jours[0]) => number) => jours.reduce((s, j) => s + f(j), 0)

  const economie = somme(j => j.economie)
  const co2 = somme(j => j.co2Evite)
  const part = somme(j => j.solaireKwh) / somme(j => j.kwhPilotes)
  const ecoQuartier = quartier.reduce((s, q) => s + q.economieParFoyer, 0)
  const co2Quartier = quartier.reduce((s, q) => s + q.co2ParFoyer, 0)
  const tauxQuartier = quartier.reduce((s, q) => s + q.taux, 0) / quartier.length
  const facture = somme(j => j.facture), factureSans = somme(j => j.factureSans)
  const pic = Math.max(...jours.map(j => j.pic))

  return (
    <div className="ecran">
      <div className="ecran__barre">
        <div className="segments" role="group" aria-label="Période">
          {PERIODES.map(p => <button key={p} type="button" aria-pressed={p === periode} onClick={() => setPeriode(p)}>{p} jours</button>)}
        </div>
        <p className="texte-2">Données de démonstration · du {etiquettes[0]} au {etiquettes[etiquettes.length - 1]}</p>
      </div>

      <div className="ecran__kpis">
        {entreprise && <Panneau><Kpi libelle="Facture électricité" valeur={euro(facture)} note={`au lieu de ${euro(factureSans)} sans pilotage`} /></Panneau>}
        <Panneau><Kpi libelle="Économisés" valeur={euro(economie)} ton="bon"
          note={entreprise ? `${nombre(100 * economie / factureSans, 1)} % de la facture` : `moyenne d'un foyer du quartier : ${euro(ecoQuartier)}`} /></Panneau>
        <Panneau><Kpi libelle="Part de soleil" valeur={pct(part)} ton="soleil" note={`le quartier consomme ${pct(tauxQuartier)} de son soleil`} /></Panneau>
        <Panneau><Kpi libelle="CO₂ évité" valeur={kg(co2)} note={entreprise ? 'par rapport aux horaires habituels' : `moyenne du quartier : ${kg(co2Quartier)}`} /></Panneau>
        {entreprise && <Panneau><Kpi libelle="Pic de puissance" valeur={nombre(pic, 1)} unite="kW" ton={pic > ABONNEMENT_LILY_KVA ? 'eviter' : 'reseau'} note={`abonnement ${ABONNEMENT_LILY_KVA} kVA · marge ${nombre(ABONNEMENT_LILY_KVA - pic, 1)} kW`} /></Panneau>}
      </div>

      <div className="ecran__graphiques">
        <Panneau titre="Euros économisés par jour" icone="euro" action={entreprise ? undefined : <Reference texte="Moyenne d'un foyer du quartier" />}>
          <GraphiqueJours valeurs={jours.map(j => j.economie)} etiquettes={etiquettes} ton="bon" format={v => nombre(v, 2) + ' €'}
            reference={entreprise ? undefined : quartier.map(q => q.economieParFoyer)} />
        </Panneau>
        <Panneau titre="Part de soleil local" icone="soleil">
          <GraphiqueJours type="ligne" valeurs={jours.map(j => (j.kwhPilotes ? j.solaireKwh / j.kwhPilotes : 0))} etiquettes={etiquettes} ton="soleil" format={v => pct(v)} />
        </Panneau>
        {entreprise ? (
          <Panneau titre="Pic de puissance par jour" icone="eclair" action={<Reference texte={`Abonnement ${ABONNEMENT_LILY_KVA} kVA`} />}>
            <GraphiqueJours valeurs={jours.map(j => j.pic)} etiquettes={etiquettes} ton="reseau" format={v => nombre(v) + ' kW'} reference={ABONNEMENT_LILY_KVA} />
          </Panneau>
        ) : (
          <Panneau titre="CO₂ évité par jour" icone="feuille" action={<Reference texte="Moyenne d'un foyer du quartier" />}>
            <GraphiqueJours valeurs={jours.map(j => j.co2Evite)} etiquettes={etiquettes} ton="reseau" format={v => nombre(v, 1) + ' kg'}
              reference={quartier.map(q => q.co2ParFoyer)} />
          </Panneau>
        )}
      </div>
    </div>
  )
}

// Légende de la ligne en pointillés (moyenne du quartier, abonnement…)
function Reference({ texte }: { texte: string }) {
  return <span className="reference-legende"><i aria-hidden="true" />{texte}</span>
}
