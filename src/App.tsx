import { useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import Choix from './pages/Choix'
import Espace from './pages/Espace'
import Offres from './pages/Offres'
import { FournisseurSimulation } from './ui/simulation'

export default function App() {
  // Prénom facultatif saisi dans le menu de profil : il remplace seulement le prénom affiché.
  const [prenom, setPrenom] = useState('')

  return (
    <FournisseurSimulation>
      <Routes>
        <Route path="/" element={<Choix />} />
        <Route path="/espace/:id" element={<Espace prenom={prenom} setPrenom={setPrenom} />} />
        <Route path="/offres" element={<Offres />} />
        <Route path="*" element={<p style={{ padding: 24 }}>Page introuvable. <Link to="/">Choisir un profil</Link></p>} />
      </Routes>
      <footer className="pied">
        Prototype de démonstration. Seuls les tarifs Tempo TTC (en vigueur au 1er août 2026) sont réels : quartier, consommations, production et appareils sont simulés.
      </footer>
    </FournisseurSimulation>
  )
}
