// Les 4 profils de démonstration proposés sur l'écran d'accueil.
export type ProfilId = 'gratuit' | 'premium' | 'entreprise' | 'ville'

export interface Profil {
  id: ProfilId
  espace: string
  persona: string
  description: string
  onglets: string[]
}

export const PROFILS: Profil[] = [
  {
    id: 'gratuit',
    espace: 'Habitant · Gratuit',
    persona: 'Anaïs',
    description: 'Habitante sans voiture électrique',
    onglets: ['Moments', 'Planning', 'Appareils', 'Bilan'],
  },
  {
    id: 'premium',
    espace: 'Habitant · Premium',
    persona: 'Inès',
    description: 'Voiture électrique et borne',
    onglets: ['Moments', 'Planning', 'Appareils', 'Bilan'],
  },
  {
    id: 'entreprise',
    espace: 'Entreprise · Pro',
    persona: 'Lily',
    description: 'Boulangerie de Lily',
    onglets: ['Moments', 'Planning', 'Équipements', 'Bilan'],
  },
  {
    id: 'ville',
    espace: 'Ville · Collectivité',
    persona: 'Sophie',
    description: 'Mairie de Montreuil',
    onglets: ['Moments', 'Ville 3D', 'Équipements', 'Bilan'],
  },
]

export function trouverProfil(id: string | undefined): Profil | undefined {
  return PROFILS.find((p) => p.id === id)
}
