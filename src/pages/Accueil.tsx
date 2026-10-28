import { Link } from 'react-router-dom'
import { PROFILS } from '../data/profils'

interface Props {
  prenom: string
  setPrenom: (valeur: string) => void
}

export default function Accueil({ prenom, setPrenom }: Props) {
  return (
    <section>
      <h1>Le bon moment pour votre énergie</h1>
      <p>Choisissez un profil de démonstration.</p>

      <label className="champ">
        Votre prénom (facultatif)
        <input
          type="text"
          value={prenom}
          maxLength={30}
          onChange={(e) => setPrenom(e.target.value)}
        />
      </label>

      <ul className="profils">
        {PROFILS.map((p) => (
          <li key={p.id}>
            <Link to={`/espace/${p.id}`} className="profil">
              <span className="profil-espace">{p.espace}</span>
              <strong>{p.persona}</strong>
              <span>{p.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
