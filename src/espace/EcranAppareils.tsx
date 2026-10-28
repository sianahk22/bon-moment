import { LIMITE_GRATUIT, nomJour } from '../data/demo'
import { Kpi, Panneau } from '../ui/composants'
import Icone from '../ui/Icone'
import { nombre } from './commun'
import type { EtatFoyer } from './useFoyer'

export default function EcranAppareils({ foyer, gratuit, libelle }: { foyer: EtatFoyer; gratuit: boolean; libelle: string }) {
  const jours = foyer.historique.jours.slice(-30)
  const moyenne = (id: string) => jours.reduce((s, j) => s + (j.parAppareil[id] ?? 0), 0) / jours.length
  const total = jours.reduce((s, j) => s + j.kwhTotal, 0) / jours.length
  const pilotes = foyer.appareils.filter(a => a.type).reduce((s, a) => s + moyenne(a.id), 0)
  const dates = foyer.historique.jours

  return (
    <div className="ecran">
      <div className="ecran__kpis">
        <Panneau>
          <Kpi libelle={`${libelle} connectés`} valeur={gratuit ? `${foyer.connectes} / ${LIMITE_GRATUIT}` : String(foyer.connectes)} ton="reseau"
            note={gratuit ? 'limite de l\'offre Gratuite' : 'pilotage automatique illimité'} />
        </Panneau>
        <Panneau><Kpi libelle={`${libelle} suivis`} valeur={String(foyer.appareils.length)} note="consommation mesurée (simulée)" /></Panneau>
        <Panneau><Kpi libelle="Consommation moyenne" valeur={nombre(total, 1)} unite="kWh/jour" note="sur les 30 derniers jours" /></Panneau>
        <Panneau><Kpi libelle="Part pilotable" valeur={`${Math.round(100 * pilotes / total)} %`} ton="soleil" note="peut être placée au bon moment" /></Panneau>
      </div>

      {foyer.limiteAtteinte && (
        <Panneau className="offre-premium">
          <Icone nom="voiture" taille={22} />
          <div>
            <b>L'offre Gratuite pilote {LIMITE_GRATUIT} appareils.</b>
            <p className="texte-2">Avec Premium (3,99 €), tous vos appareils se lancent automatiquement au bon moment. Ici, cet appareil reste en mode rappel.</p>
          </div>
          <button type="button" className="btn btn--contour" onClick={() => foyer.setLimiteAtteinte(false)}>Compris</button>
        </Panneau>
      )}

      <Panneau titre={`Mes ${libelle.toLowerCase()}`} icone="appareils">
        <div className="appareils" role="table" aria-label={`Liste des ${libelle.toLowerCase()}`}>
          <div className="appareils__ligne appareils__entete" role="row">
            <span role="columnheader">Appareil</span>
            <span role="columnheader">Puissance</span>
            <span role="columnheader">Conso. moyenne</span>
            <span role="columnheader">Dernière utilisation</span>
            <span role="columnheader">Mode</span>
          </div>
          {foyer.appareils.map(a => {
            const der = foyer.historique.derniereUtilisation[a.id]
            const actif = a.connecte && a.auto
            return (
              <div key={a.id} className="appareils__ligne" role="row">
                <span className="appareils__nom" role="cell">
                  <span className="besoin__icone"><Icone nom={a.icone} taille={18} /></span>
                  <span><b>{a.nom}</b><small>{a.detail}</small></span>
                </span>
                <span className="chiffre" role="cell">{nombre(a.puissance, a.puissance < 1 ? 2 : 1)} kW</span>
                <span className="chiffre" role="cell">{nombre(moyenne(a.id), 1)} kWh/j</span>
                <span role="cell" className="texte-2">
                  {a.type ? (der ? `${nomJour(der.decalage, dates[dates.length + der.decalage].cal.date)} · ${der.heure}` : '–') : 'Tous les jours'}
                </span>
                <span role="cell">
                  {a.type ? (
                    <label className="interrupteur interrupteur--compact">
                      <span>{actif ? 'Automatique' : 'Rappel'}</span>
                      <input type="checkbox" checked={actif} onChange={() => foyer.basculerAuto(a.id)} aria-label={`Pilotage automatique : ${a.nom}`} />
                    </label>
                  ) : <span className="mode mode--mesure">Mesuré</span>}
                </span>
              </div>
            )
          })}
        </div>
      </Panneau>
    </div>
  )
}
