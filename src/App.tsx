import { useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import Accueil from './pages/Accueil'
import Espace from './pages/Espace'
import Offres from './pages/Offres'

export default function App() {
  // Prénom facultatif saisi sur l'accueil : il remplace seulement le prénom affiché.
  const [prenom, setPrenom] = useState('')

  return (
    <div className="app">
      <header className="entete">
        <Link to="/" className="logo">Le Bon Moment</Link>
        <nav>
          <Link to="/offres">Offres</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Accueil prenom={prenom} setPrenom={setPrenom} />} />
          <Route path="/espace/:id" element={<Espace prenom={prenom} />} />
          <Route path="/offres" element={<Offres />} />
          <Route path="*" element={<p>Page introuvable. <Link to="/">Retour à l'accueil</Link></p>} />
        </Routes>
      </main>

      <footer className="pied">
        Seuls les tarifs Tempo TTC (1er août 2026) sont réels. Toutes les autres données sont des données de démonstration.
      </footer>
    </div>
  )
}
