import type { NomIcone } from '../ui/Icone'
import type { UserId } from './appareils'

// Les 4 profils de démonstration.
export type ProfilId = 'gratuit' | 'premium' | 'entreprise' | 'ville'

export interface Onglet {
  nom: string
  icone: NomIcone
}

export interface Profil {
  id: ProfilId
  type: string // ce que l'utilisateur choisit à l'ouverture
  espace: string
  offre: string
  detail: string // ce qui distingue ce profil
  promesse: string // ce que l'utilisateur obtient, en une phrase
  points: [string, string]
  persona: string
  description: string
  icone: NomIcone
  userId?: UserId // profil du moteur (aucun pour la Ville : elle regarde tout le quartier)
  onglets: Onglet[]
  ongletInitial: number
}

const MOMENTS: Onglet = { nom: 'Moments', icone: 'moments' }
const PLANNING: Onglet = { nom: 'Planning', icone: 'planning' }
const BILAN: Onglet = { nom: 'Bilan', icone: 'bilan' }

export const PROFILS: Profil[] = [
  {
    id: 'gratuit',
    promesse: 'Je sais quand lancer mes appareils',
    points: ['Rappels au bon moment', '2 appareils pilotés'],
    type: 'Particulier',
    espace: 'Habitant',
    offre: 'Gratuit',
    detail: 'Rappels au bon moment · 2 appareils connectés maximum',
    persona: 'Anaïs',
    description: 'sans voiture électrique',
    icone: 'maison',
    userId: 'anais',
    onglets: [MOMENTS, PLANNING, { nom: 'Appareils', icone: 'appareils' }, BILAN],
    ongletInitial: 1,
  },
  {
    id: 'premium',
    promesse: 'Mes appareils se lancent tout seuls',
    points: ['Voiture et borne pilotées', 'Appareils illimités'],
    type: 'Particulier connecté',
    espace: 'Habitant',
    offre: 'Premium · 3,99 €',
    detail: 'Pilotage automatique · appareils connectés illimités',
    persona: 'Inès',
    description: 'voiture électrique et borne',
    icone: 'voiture',
    userId: 'ines',
    onglets: [MOMENTS, PLANNING, { nom: 'Appareils', icone: 'appareils' }, BILAN],
    ongletInitial: 1,
  },
  {
    id: 'entreprise',
    promesse: 'Je réduis la facture de mon commerce',
    points: ['Fours, froid, livraisons', 'Pic sous l\'abonnement'],
    type: 'Entreprise',
    espace: 'Entreprise',
    offre: 'Pro · sur devis',
    detail: 'Équipements professionnels et contraintes métier',
    persona: 'Lily',
    description: 'Boulangerie de Lily',
    icone: 'boutique',
    userId: 'lily',
    onglets: [MOMENTS, PLANNING, { nom: 'Équipements', icone: 'equipements' }, BILAN],
    ongletInitial: 1,
  },
  {
    id: 'ville',
    promesse: 'Je pilote l\'énergie du quartier',
    points: ['Jumeau numérique 3D', 'Coordination des voisins'],
    type: 'Collectivité',
    espace: 'Ville',
    offre: 'Licence annuelle',
    detail: 'Jumeau numérique 3D du quartier et coordination',
    persona: 'Sophie',
    description: 'Mairie de Montreuil',
    icone: 'mairie',
    onglets: [MOMENTS, { nom: 'Ville 3D', icone: 'ville3d' }, { nom: 'Équipements', icone: 'equipements' }, BILAN],
    ongletInitial: 1,
  },
]

export function trouverProfil(id: string | undefined): Profil | undefined {
  return PROFILS.find((p) => p.id === id)
}
