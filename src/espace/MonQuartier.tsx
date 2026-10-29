import { kw, pct } from '../engine'
import Icone from '../ui/Icone'
import { useSimulation } from '../ui/simulation'
import { nombre } from './commun'

// « Mon quartier aujourd'hui » : ce que la coordination de tous les voisins change, calculé par le moteur.
export default function MonQuartier() {
  const { q } = useSimulation()
  const { on, off } = q
  const deplaces = on.flex.reduce((t, v, i) => t + Math.max(0, v - off.flex[i]) * .5, 0)

  return (
    <section className="mon-quartier" aria-label="Mon quartier aujourd'hui">
      <span className="mon-quartier__icone"><Icone nom="soleil" taille={22} /></span>
      <div className="mon-quartier__chiffre">
        <span className="surtitre">Mon quartier aujourd'hui</span>
        <span className="mon-quartier__valeur chiffre">{pct(on.taux)}</span>
        <span className="mon-quartier__legende">du soleil du gymnase consommé sur place</span>
      </div>
      <div className="mon-quartier__jauge" aria-hidden="true">
        <span className="mon-quartier__barre"><i style={{ width: `${Math.round(on.taux * 100)}%` }} /></span>
        <span className="mon-quartier__barre mon-quartier__barre--sans"><i style={{ width: `${Math.round(off.taux * 100)}%` }} /></span>
        <span className="mon-quartier__reperes"><span>avec coordination</span><span>sans : {pct(off.taux)}</span></span>
      </div>
      <p className="mon-quartier__phrase">
        Les 30 foyers du quartier sont coordonnés : <b className="chiffre">{nombre(deplaces)} kWh</b> déplacés vers les heures de soleil,
        et le poste électrique reste à <b className="chiffre">{kw(on.peak)}</b> au lieu de {kw(off.peak)}.
      </p>
    </section>
  )
}
