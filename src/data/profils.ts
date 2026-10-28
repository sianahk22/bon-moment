import type { NomIcone } from '../ui/Icone'
import type { UserId } from './appareils'

// Les 4 profils de démonstration proposés sur l'écran d'accueil.
export type ProfilId = 'gratuit' | 'premium' | 'entreprise' | 'ville'

export interface Onglet {
  nom: string
  icone: NomIcone
}

export interface Profil {
  id: ProfilId
  espace: string
  offre: string
  persona: string
  description: string
  accroche: string
  icone: NomIcone
  userId?: UserId // profil du moteur (aucun pour la Ville : elle regarde tout le quartier)
  onglets: Onglet[]
}

const MOMENTS: Onglet = { nom: 'Moments', icone: 'moments' }
const PLANNING: Onglet = { nom: 'Planning', icone: 'planning' }
const BILAN: Onglet = { nom: 'Bilan', icone: 'bilan' }

export const PROFILS: Profil[] = [
  {
    id: 'gratuit',
    espace: 'Habitant',
    offre: 'Gratuit',
    persona: 'Anaïs',
    description: 'Habitante sans voiture électrique',
    accroche: 'Les meilleurs moments du jour, et un rappel quand c\'est le bon.',
    icone: 'maison',
    userId: 'anais',
    onglets: [MOMENTS, PLANNING, { nom: 'Appareils', icone: 'appareils' }, BILAN],
  },
  {
    id: 'premium',
    espace: 'Habitant',
    offre: 'Premium',
    persona: 'Inès',
    description: 'Voiture électrique et borne',
    accroche: 'La voiture se recharge toute seule, au soleil du quartier.',
    icone: 'voiture',
    userId: 'ines',
    onglets: [MOMENTS, PLANNING, { nom: 'Appareils', icone: 'appareils' }, BILAN],
  },
  {
    id: 'entreprise',
    espace: 'Entreprise',
    offre: 'Pro',
    persona: 'Lily',
    description: 'Boulangerie de Lily',
    accroche: 'Fours, chambre froide et livraisons, prêts pour l\'ouverture à 4 h.',
    icone: 'boutique',
    userId: 'lily',
    onglets: [MOMENTS, PLANNING, { nom: 'Équipements', icone: 'equipements' }, BILAN],
  },
  {
    id: 'ville',
    espace: 'Ville',
    offre: 'Collectivité',
    persona: 'Sophie',
    description: 'Mairie de Montreuil',
    accroche: 'Le jumeau numérique du quartier : chaque voisin au bon moment, ensemble.',
    icone: 'mairie',
    onglets: [MOMENTS, { nom: 'Ville 3D', icone: 'ville3d' }, { nom: 'Équipements', icone: 'equipements' }, BILAN],
  },
]

export function trouverProfil(id: string | undefined): Profil | undefined {
  return PROFILS.find((p) => p.id === id)
}
