import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { trouverProfil } from '../data/profils'

interface Props {
  prenom: string
}

// Page commune aux 4 espaces. Le contenu de chaque onglet sera construit dans les étapes suivantes.
export default function Espace({ prenom }: Props) {
  const { id } = useParams()
  const profil = trouverProfil(id)
  const [onglet, setOnglet] = useState(0)

  if (!profil) {
    return <p>Espace inconnu. <Link to="/">Retour à l'accueil</Link></p>
  }

  const nomAffiche = prenom.trim() || profil.persona

  return (
    <section>
      <p className="bandeau-demo">Données de démonstration</p>
      <p className="profil-espace">{profil.espace}</p>
      <h1>Bonjour {nomAffiche}</h1>

      <nav className="onglets" role="tablist">
        {profil.onglets.map((nom, i) => (
          <button
            key={nom}
            role="tab"
            aria-selected={i === onglet}
            onClick={() => setOnglet(i)}
          >
            {nom}
          </button>
        ))}
      </nav>

      <div className="panneau" role="tabpanel">
        <h2>{profil.onglets[onglet]}</h2>
        <p>Contenu à venir.</p>
      </div>
    </section>
  )
}
