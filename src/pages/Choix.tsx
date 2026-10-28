import { Link } from 'react-router-dom'
import { PROFILS } from '../data/profils'
import { BandeauDemo } from '../ui/composants'
import Icone from '../ui/Icone'
import Logo from '../ui/Logo'

// Écran d'ouverture : on choisit son type de profil, sans texte de présentation.
export default function Choix() {
  return (
    <div className="choix">
      <div className="choix__tete">
        <span className="marque"><Logo /><span>Le Bon Moment</span></span>
        <BandeauDemo />
      </div>
      <h1 className="choix__question">Vous êtes…</h1>
      <ul className="choix__liste">
        {PROFILS.map(p => (
          <li key={p.id}>
            <Link to={`/espace/${p.id}`} className="choix__carte">
              <span className="choix__icone"><Icone nom={p.icone} taille={26} /></span>
              <b>{p.type}</b>
              <span className="choix__offre">{p.offre}</span>
              <span className="choix__detail">{p.detail}</span>
              <span className="choix__persona">Démo : {p.persona} · {p.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
