import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PROFILS } from '../data/profils'
import { BandeauDemo } from '../ui/composants'
import Icone from '../ui/Icone'
import Logo from '../ui/Logo'
import VilleLumiere from '../ui/VilleLumiere'

// Écran d'ouverture : une smart city lumineuse en fond, et 4 grandes cartes tactiles pour choisir son espace.
export default function Choix() {
  const etroit = useEcranEtroit()
  return (
    <div className="accueil">
      <VilleLumiere etroit={etroit} />
      <div className="accueil__voile" aria-hidden="true" />

      <div className="accueil__contenu">
        <header className="accueil__tete">
          <span className="marque"><Logo /><span>Le Bon Moment</span></span>
          <BandeauDemo />
        </header>

        <main className="accueil__corps">
          <h1 className="accueil__question">Qui êtes-vous&nbsp;?</h1>
          <p className="accueil__aide">Touchez un profil : il est déjà rempli, prêt à explorer.</p>

          <ul className="accueil__cartes">
            {PROFILS.map((p, i) => (
              <li key={p.id} style={{ animationDelay: `${250 + i * 70}ms` }}>
                <Link to={`/espace/${p.id}`} className={`carte-profil carte-profil--${p.id}`}>
                  <span className="carte-profil__haut">
                    <span className="carte-profil__icone"><Icone nom={p.icone} taille={26} /></span>
                    <span className="carte-profil__offre">{p.offre}</span>
                  </span>
                  <span className="carte-profil__type">{p.type}</span>
                  <span className="carte-profil__promesse">{p.promesse}</span>
                  <span className="carte-profil__points">
                    {p.points.map(pt => <span key={pt}><Icone nom="coche" taille={14} />{pt}</span>)}
                  </span>
                  <span className="carte-profil__bas">
                    <span className="carte-profil__persona"><span className="avatar avatar--petit" aria-hidden="true">{p.persona[0]}</span>Démo · {p.persona}</span>
                    <span className="carte-profil__fleche" aria-hidden="true"><Icone nom="fleche" taille={18} /></span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  )
}

// Vrai sur tablette et téléphone (même seuil que accueil.css).
function useEcranEtroit() {
  const requete = '(max-width: 1100px)'
  const [etroit, setEtroit] = useState(() => matchMedia(requete).matches)
  useEffect(() => {
    const m = matchMedia(requete)
    const maj = () => setEtroit(m.matches)
    m.addEventListener('change', maj)
    return () => m.removeEventListener('change', maj)
  }, [])
  return etroit
}
