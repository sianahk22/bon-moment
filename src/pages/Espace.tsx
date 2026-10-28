import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { trouverProfil, type Profil } from '../data/profils'
import { Panneau } from '../ui/composants'
import Coque from '../ui/Coque'
import Icone from '../ui/Icone'
import VueVille from '../ville/VueVille'

interface Props {
  prenom: string
  setPrenom: (v: string) => void
}

// Page commune aux 4 espaces : même coque, contenu central selon le profil et l'onglet.
export default function Espace({ prenom, setPrenom }: Props) {
  const { id } = useParams()
  const profil = trouverProfil(id)

  if (!profil) {
    return <p style={{ padding: 24 }}>Espace inconnu. <Link to="/">Choisir un profil</Link></p>
  }
  // `key` : en changeant d'espace, l'onglet repart sur l'onglet initial du nouveau profil.
  return <EspaceProfil key={profil.id} profil={profil} prenom={prenom} setPrenom={setPrenom} />
}

function EspaceProfil({ profil, prenom, setPrenom }: { profil: Profil } & Props) {
  const [onglet, setOnglet] = useState(profil.ongletInitial)
  const nomOnglet = profil.onglets[onglet].nom

  return (
    <Coque profil={profil} onglet={onglet} setOnglet={setOnglet} prenom={prenom} setPrenom={setPrenom}>
      {profil.id === 'ville' && nomOnglet === 'Ville 3D' ? (
        <VueVille />
      ) : (
        <div className="zone__page">
          <Panneau>
            <div className="a-venir">
              <Icone nom={profil.onglets[onglet].icone} taille={32} />
              <h2>{nomOnglet}</h2>
              <p>Cet écran est construit à l'étape suivante.</p>
            </div>
          </Panneau>
        </div>
      )}
    </Coque>
  )
}
