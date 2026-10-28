import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { UserId } from '../data/appareils'
import { trouverProfil, type Profil } from '../data/profils'
import EcranAppareils from '../espace/EcranAppareils'
import EcranBilan from '../espace/EcranBilan'
import EcranMoments from '../espace/EcranMoments'
import EcranPlanning from '../espace/EcranPlanning'
import { useFoyer } from '../espace/useFoyer'
import Coque from '../ui/Coque'
import EcranVilleBilan from '../ville/EcranVilleBilan'
import EcranVilleEquipements from '../ville/EcranVilleEquipements'
import EcranVilleMoments from '../ville/EcranVilleMoments'
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

  return (
    <Coque profil={profil} onglet={onglet} setOnglet={setOnglet} prenom={prenom} setPrenom={setPrenom}>
      {profil.userId
        ? <EspaceFoyer profil={profil} userId={profil.userId} onglet={profil.onglets[onglet].nom} />
        : <EspaceVille onglet={profil.onglets[onglet].nom} />}
    </Coque>
  )
}

// Espaces Particulier, Particulier connecté et Entreprise : mêmes écrans, données du personnage.
function EspaceFoyer({ profil, userId, onglet }: { profil: Profil; userId: UserId; onglet: string }) {
  const gratuit = profil.id === 'gratuit', entreprise = profil.id === 'entreprise'
  const foyer = useFoyer(userId, gratuit)

  if (onglet === 'Moments') return <EcranMoments foyer={foyer} />
  if (onglet === 'Planning') return <EcranPlanning foyer={foyer} />
  if (onglet === 'Bilan') return <EcranBilan foyer={foyer} entreprise={entreprise} />
  return <EcranAppareils foyer={foyer} gratuit={gratuit} libelle={entreprise ? 'Équipements' : 'Appareils'} />
}

// Espace Ville (Sophie) : la 3D et les écrans de pilotage du quartier.
function EspaceVille({ onglet }: { onglet: string }) {
  if (onglet === 'Ville 3D') return <VueVille />
  if (onglet === 'Moments') return <EcranVilleMoments />
  if (onglet === 'Bilan') return <EcranVilleBilan />
  return <EcranVilleEquipements />
}
