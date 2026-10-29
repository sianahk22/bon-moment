import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CATALOGUE, LIMITE_GRATUIT, nomJour } from '../data/demo'
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
  const [ajout, setAjout] = useState(false)
  const [modele, setModele] = useState(0)
  const connu = (id: string) => jours.some(j => id in j.parAppareil)
  const premium = <Link to="/offres" className="btn btn--soleil btn--petit">Passer en Premium · 3,99 €</Link>

  return (
    <div className="ecran">
      <div className="ecran__kpis">
        <Panneau>
          <Kpi icone="appareils" libelle={`${libelle} connectés`} valeur={gratuit ? `${foyer.connectes} / ${LIMITE_GRATUIT}` : String(foyer.connectes)} ton="reseau"
            note={gratuit ? 'limite de l\'offre Gratuite' : 'pilotage automatique illimité'} />
          {gratuit && <div className="kpi__action">{premium}</div>}
        </Panneau>
        <Panneau><Kpi icone="eclair" libelle={`${libelle} suivis`} valeur={String(foyer.appareils.length)} note="consommation mesurée (simulée)" /></Panneau>
        <Panneau><Kpi icone="eclair" libelle="Consommation moyenne" valeur={nombre(total, 1)} unite="kWh/jour" note="sur les 30 derniers jours" /></Panneau>
        <Panneau><Kpi icone="soleil" libelle="Part pilotable" valeur={`${Math.round(100 * pilotes / total)} %`} ton="soleil" note="peut être placée au bon moment" /></Panneau>
      </div>

      {foyer.limiteAtteinte && (
        <Panneau className="offre-premium">
          <Icone nom="voiture" taille={22} />
          <div>
            <b>L'offre Gratuite pilote {LIMITE_GRATUIT} appareils.</b>
            <p className="texte-2">Avec Premium (3,99 €), tous vos appareils se lancent automatiquement au bon moment. Ici, cet appareil reste en mode rappel.</p>
          </div>
          <div className="offre-premium__actions">
            {premium}
            <button type="button" className="btn btn--contour" onClick={() => foyer.setLimiteAtteinte(false)}>Compris</button>
          </div>
        </Panneau>
      )}

      <Panneau titre={`Mes ${libelle.toLowerCase()}`} icone="appareils" action={
        <button type="button" className="btn btn--plein" aria-expanded={ajout} onClick={() => setAjout(!ajout)}>
          <Icone nom={ajout ? 'croix' : 'appareils'} taille={16} />{ajout ? 'Fermer' : `Ajouter un ${libelle === 'Équipements' ? 'équipement' : 'appareil'}`}
        </button>
      }>
        {ajout && (
          <form className="ajout-appareil" onSubmit={e => { e.preventDefault(); foyer.ajouterAppareil(CATALOGUE[modele]); setAjout(false) }}>
            <label className="champ">
              <span className="surtitre">Appareil à ajouter</span>
              <select value={modele} onChange={e => setModele(Number(e.target.value))}>
                {CATALOGUE.map((m, i) => <option key={m.nom} value={i}>{m.nom} · {m.type ? 'pilotable' : 'consommation estimée'}</option>)}
              </select>
            </label>
            <p className="texte-2">{CATALOGUE[modele].type
              ? (gratuit && foyer.connectes >= LIMITE_GRATUIT ? 'Vos 2 appareils connectés sont déjà utilisés : celui-ci fonctionnera en mode rappel.' : 'Il sera piloté automatiquement au bon moment.')
              : 'Sa consommation sera estimée pour compléter votre bilan.'}</p>
            <button type="submit" className="btn btn--soleil">Ajouter</button>
          </form>
        )}
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
                <span className="chiffre" role="cell">{connu(a.id) ? `${nombre(moyenne(a.id), 1)} kWh/j` : <span className="mode mode--nouveau">Nouveau</span>}</span>
                <span role="cell" className="texte-2">
                  {!connu(a.id) ? 'Pas encore utilisé' : a.type ? (der ? `${nomJour(der.decalage, dates[dates.length + der.decalage].cal.date)} · ${der.heure}` : '–') : 'Tous les jours'}
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
