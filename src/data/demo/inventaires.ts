import { bump } from '../../engine'
import type { NomIcone } from '../../ui/Icone'
import type { DeviceId, UserId } from '../appareils'

// Tout ce que chaque personnage branche chez lui (données de démonstration).
// - Les appareils « pilotables » ont un `type` : le moteur choisit leur créneau.
// - Les autres sont seulement mesurés : `profil(h)` donne leur puissance moyenne (kW) à l'heure h.
export interface Appareil {
  id: string
  nom: string
  detail: string
  icone: NomIcone
  puissance: number // kW en fonctionnement
  type?: DeviceId
  connecte: boolean
  auto: boolean
  profil?: (h: number) => number
}

export const LIMITE_GRATUIT = 2 // appareils connectés dans l'offre Gratuite
export const ABONNEMENT_LILY_KVA = 36 // puissance souscrite de la boulangerie

const cuisine = (h: number) => 1.3 * bump(h, 12.5, .5) + 1.7 * bump(h, 19.75, .6)
const soiree = (h: number) => .02 + .1 * bump(h, 21, 1.5)
const lumiere = (h: number) => .02 + .1 * bump(h, 20.5, 1.8) + .05 * bump(h, 7, .7)
const ouvert = (h: number) => h >= 6 && h < 19.5

export const INVENTAIRES: Record<UserId, Appareil[]> = {
  ines: [
    { id: 'voiture', nom: 'Voiture électrique et borne', detail: 'Borne 3,7 kW au parking', icone: 'voiture', puissance: 3.7, type: 'voiture', connecte: true, auto: true },
    { id: 'linge', nom: 'Lave-linge', detail: 'Programme 40 °C', icone: 'linge', puissance: .8, type: 'linge', connecte: true, auto: true },
    { id: 'vaisselle', nom: 'Lave-vaisselle', detail: 'Programme éco', icone: 'vaisselle', puissance: 1, type: 'vaisselle', connecte: true, auto: true },
    { id: 'secheLinge', nom: 'Sèche-linge', detail: 'Pompe à chaleur', icone: 'secheLinge', puissance: 1, type: 'secheLinge', connecte: true, auto: true },
    { id: 'eau', nom: 'Chauffe-eau', detail: 'Ballon de 200 L', icone: 'eau', puissance: 2.4, type: 'eau', connecte: true, auto: true },
    { id: 'radiateurs', nom: 'Radiateurs', detail: '3 radiateurs à inertie · chauffage au réveil et le soir', icone: 'radiateur', puissance: 2, connecte: false, auto: false, profil: h => .6 * bump(h, 7, 1) + .8 * bump(h, 20, 2) },
    { id: 'frigo', nom: 'Réfrigérateur', detail: 'Combiné 300 L', icone: 'frigo', puissance: .12, connecte: false, auto: false, profil: () => .045 },
    { id: 'plaques', nom: 'Plaques à induction', detail: '3 foyers', icone: 'plaques', puissance: 3, connecte: false, auto: false, profil: cuisine },
    { id: 'four', nom: 'Four', detail: 'Four multifonction', icone: 'four', puissance: 2.4, connecte: false, auto: false, profil: h => .5 * bump(h, 19.5, .5) },
    { id: 'tv', nom: 'Télévision et box', detail: 'Écran 55" + box internet', icone: 'ecran', puissance: .15, connecte: false, auto: false, profil: soiree },
    { id: 'ordi', nom: 'Ordinateur', detail: 'Portable et écran (télétravail)', icone: 'ordinateur', puissance: .09, connecte: false, auto: false, profil: h => .07 * bump(h, 14, 3) },
    { id: 'lumiere', nom: 'Éclairage', detail: 'LED, tout le logement', icone: 'lampe', puissance: .2, connecte: false, auto: false, profil: lumiere },
  ],
  anais: [
    { id: 'linge', nom: 'Lave-linge', detail: 'Programme 40 °C', icone: 'linge', puissance: .8, type: 'linge', connecte: true, auto: true },
    { id: 'eau', nom: 'Chauffe-eau', detail: 'Ballon de 150 L', icone: 'eau', puissance: 2.4, type: 'eau', connecte: true, auto: true },
    { id: 'vaisselle', nom: 'Lave-vaisselle', detail: 'Programme éco', icone: 'vaisselle', puissance: 1, type: 'vaisselle', connecte: false, auto: false },
    { id: 'frigo', nom: 'Réfrigérateur', detail: 'Table top 130 L', icone: 'frigo', puissance: .08, connecte: false, auto: false, profil: () => .03 },
    { id: 'plaques', nom: 'Plaques électriques', detail: '2 foyers', icone: 'plaques', puissance: 2, connecte: false, auto: false, profil: h => .8 * cuisine(h) },
    { id: 'tv', nom: 'Box et télévision', detail: 'Box internet + écran 32"', icone: 'ecran', puissance: .1, connecte: false, auto: false, profil: soiree },
    { id: 'ordi', nom: 'Ordinateur portable', detail: 'Études et loisirs', icone: 'ordinateur', puissance: .06, connecte: false, auto: false, profil: h => .04 * bump(h, 20, 2.5) },
    { id: 'lumiere', nom: 'Éclairage', detail: 'LED', icone: 'lampe', puissance: .1, connecte: false, auto: false, profil: h => .7 * lumiere(h) },
  ],
  lily: [
    { id: 'froid', nom: 'Chambre froide', detail: 'Pré-refroidissement à -21 °C', icone: 'froid', puissance: 3, type: 'froid', connecte: true, auto: true },
    { id: 'utilitaire', nom: 'Utilitaire de livraison', detail: 'Recharge +30 kWh', icone: 'utilitaire', puissance: 7, type: 'utilitaire', connecte: true, auto: true },
    { id: 'eau', nom: 'Eau chaude', detail: 'Ballon de 300 L', icone: 'eau', puissance: 2.4, type: 'eau', connecte: true, auto: true },
    { id: 'vaisselle', nom: 'Lave-vaisselle pro', detail: 'Bacs et plaques', icone: 'vaisselle', puissance: 1, type: 'vaisselle', connecte: true, auto: true },
    { id: 'fours', nom: 'Fours à sole', detail: 'Cuisson de 1 h à 6 h, non déplaçable', icone: 'four', puissance: 18, connecte: false, auto: false, profil: h => (h >= 1 && h < 6 ? 14 : h >= 6 && h < 11 ? 3 : 0) },
    { id: 'petrin', nom: 'Pétrin', detail: 'Pétrissage à minuit', icone: 'equipements', puissance: 3, connecte: false, auto: false, profil: h => (h >= 0 && h < 1.5 ? 2.5 : 0) },
    { id: 'vitrine', nom: 'Vitrine réfrigérée', detail: 'Pâtisseries', icone: 'frigo', puissance: .8, connecte: false, auto: false, profil: () => .6 },
    { id: 'lumiere', nom: 'Éclairage boutique', detail: 'Ouverture 6 h – 19 h 30', icone: 'lampe', puissance: .6, connecte: false, auto: false, profil: h => (ouvert(h) ? .6 : .05) },
    { id: 'caisse', nom: 'Caisse et terminal', detail: 'Toujours allumés', icone: 'ordinateur', puissance: .05, connecte: false, auto: false, profil: () => .05 },
  ],
}
