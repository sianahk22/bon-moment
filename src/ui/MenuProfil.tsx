import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PROFILS, type Profil } from '../data/profils'
import Icone from './Icone'

// Petit menu en haut à droite : avatar + prénom, changement d'espace, saisie du prénom.
export default function MenuProfil({ profil, prenom, setPrenom }: { profil: Profil; prenom: string; setPrenom: (v: string) => void }) {
  const [ouvert, setOuvert] = useState(false)
  const boite = useRef<HTMLDivElement>(null)
  const naviguer = useNavigate()
  const nom = prenom.trim() || profil.persona

  // Fermeture au clic à l'extérieur ou avec la touche Échap
  useEffect(() => {
    if (!ouvert) return
    const clic = (e: MouseEvent) => { if (!boite.current?.contains(e.target as Node)) setOuvert(false) }
    const touche = (e: KeyboardEvent) => { if (e.key === 'Escape') setOuvert(false) }
    document.addEventListener('mousedown', clic)
    document.addEventListener('keydown', touche)
    return () => { document.removeEventListener('mousedown', clic); document.removeEventListener('keydown', touche) }
  }, [ouvert])

  return (
    <div className="menu-profil" ref={boite}>
      <button type="button" className="menu-profil__bouton" aria-haspopup="true" aria-expanded={ouvert} onClick={() => setOuvert(!ouvert)}>
        <Avatar initiale={nom[0]} />
        <span className="menu-profil__nom">
          <b>{nom}</b>
          <small>{profil.espace} · {profil.offre}</small>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </button>

      {ouvert && (
        <div className="menu-profil__liste panneau panneau--flottant">
          <p className="surtitre">Changer d'espace</p>
          <ul>
            {PROFILS.map(p => (
              <li key={p.id}>
                <button
                  type="button"
                  className="menu-profil__choix"
                  aria-current={p.id === profil.id}
                  onClick={() => { setOuvert(false); naviguer(`/espace/${p.id}`) }}
                >
                  <span className="menu-profil__icone"><Icone nom={p.icone} taille={18} /></span>
                  <span><b>{p.persona}</b><small>{p.type}</small></span>
                </button>
              </li>
            ))}
          </ul>
          <Link to="/offres" className="menu-profil__lien" onClick={() => setOuvert(false)}>Voir les offres →</Link>
          <label className="champ">
            <span className="surtitre">Votre prénom (facultatif)</span>
            <input type="text" value={prenom} maxLength={30} placeholder={profil.persona} onChange={e => setPrenom(e.target.value)} />
          </label>
        </div>
      )}
    </div>
  )
}

export function Avatar({ initiale }: { initiale: string }) {
  return <span className="avatar" aria-hidden="true">{initiale.toUpperCase()}</span>
}
