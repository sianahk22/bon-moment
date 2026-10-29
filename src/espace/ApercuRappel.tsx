import { euro, label, pct } from '../engine'
import Logo from '../ui/Logo'
import type { EtatFoyer } from './useFoyer'

// Aperçu du rappel envoyé pour un appareil non connecté, façon notification sur l'écran verrouillé d'un téléphone.
// Le contenu vient du planning calculé (créneau, part de soleil, économie). Aucune notification réelle n'est envoyée.
export default function ApercuRappel({ foyer }: { foyer: EtatFoyer }) {
  const j = foyer.aujourdhui
  const k = j.taches.findIndex(t => !t.auto)
  if (k < 0) return null
  const t = j.taches[k]
  const debut = Math.min(...j.reel[k]), fin = Math.max(...j.reel[k]) + 1
  const kwh = t.p * .5 * j.reel[k].length
  const soleil = kwh ? j.bilan.per[k].sol / kwh : 0
  const gain = j.f.naive.per[k].cost - j.bilan.per[k].cost

  return (
    <figure className="telephone" aria-label={`Aperçu du rappel : ${t.name}`}>
      <div className="telephone__ecran">
        <span className="telephone__heure chiffre">{label(debut).replace('h', ':').replace(/:$/, ':00')}</span>
        <span className="telephone__date">{new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(j.cal.date)}</span>
        <div className="bulle">
          <div className="bulle__tete">
            <Logo taille={20} />
            <span>Le Bon Moment</span>
            <span className="bulle__quand">maintenant</span>
          </div>
          <b className="bulle__titre">C'est le bon moment</b>
          <p className="bulle__texte">
            Lancez votre {t.name.toLowerCase()} : {soleil > .05 ? `${pct(soleil)} de son énergie viendra du soleil du quartier` : 'l\'électricité est moins chère et moins polluante'} jusqu'à {label(fin)}.
            {gain > .005 && <> Économie estimée : {euro(gain)}.</>}
          </p>
        </div>
      </div>
      <figcaption>Aperçu de démonstration : aucune notification réelle n'est envoyée.</figcaption>
    </figure>
  )
}
