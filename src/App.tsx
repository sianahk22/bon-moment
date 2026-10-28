import { useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import Accueil from './pages/Accueil'
import Espace from './pages/Espace'
import Offres from './pages/Offres'
import Logo from './ui/Logo'

export default function App() {
  // Prénom facultatif saisi sur l'accueil : il remplace seulement le prénom affiché.
  const [prenom, setPrenom] = useState('')
  const { pathname } = useLocation()

  return (
    <div className={`app ${pathname.startsWith('/espace/') ? 'app--onglets' : ''}`}>
      <header className="entete">
        <div className="entete__dedans">
          <Link to="/" className="marque" aria-label="Le Bon Moment, accueil">
            <Logo />
            Le Bon Moment
          </Link>
          <nav aria-label="Navigation principale">
            <NavLink to="/" end>Espaces</NavLink>
            <NavLink to="/offres">Offres</NavLink>
          </nav>
        </div>
      </header>

      <main className="page">
        <Routes>
          <Route path="/" element={<Accueil prenom={prenom} setPrenom={setPrenom} />} />
          <Route path="/espace/:id" element={<Espace prenom={prenom} />} />
          <Route path="/offres" element={<Offres />} />
          <Route path="*" element={<p>Page introuvable. <Link to="/">Retour à l'accueil</Link></p>} />
        </Routes>
      </main>

      <footer className="pied">
        <p>Prototype de démonstration. Seuls les tarifs Tempo TTC (en vigueur au 1er août 2026) sont réels : quartier, consommations, production et appareils sont simulés.</p>
      </footer>
    </div>
  )
}
