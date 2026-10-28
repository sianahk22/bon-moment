import { SLOTS, slotOfHour, type Foyer, type TacheFoyer } from '../engine'

// Appareils (puissance en kW, durée en créneaux de 30 min). Données de démonstration.
export const DEVICES = {
  voiture:    { name: 'Voiture électrique', detail: '+20 kWh (de 30 à 70 %)', p: 3.7, dur: 11, interruptible: true, auto: true, habitH: 18.5 },
  linge:      { name: 'Lave-linge', detail: 'Programme 40 °C', p: .8, dur: 3, interruptible: false, auto: false, habitH: 19 },
  eau:        { name: 'Chauffe-eau', detail: 'Ballon de 200 L', p: 2.4, dur: 4, interruptible: true, auto: true, habitH: 22 },
  vaisselle:  { name: 'Lave-vaisselle', detail: 'Programme éco', p: 1, dur: 3, interruptible: false, auto: false, habitH: 21 },
  secheLinge: { name: 'Sèche-linge', detail: 'Pompe à chaleur', p: 1, dur: 4, interruptible: false, auto: true, habitH: 19 },
  froid:      { name: 'Chambre froide', detail: 'Pré-refroidissement à -21 °C', p: 3, dur: 8, interruptible: true, auto: true, habitH: 16 },
  utilitaire: { name: 'Utilitaire de livraison', detail: '+30 kWh', p: 7, dur: 9, interruptible: true, auto: true, habitH: 13 },
}
export type DeviceId = keyof typeof DEVICES

let uid = 0
export const mkTask = (type: DeviceId, deadlineH: number): TacheFoyer => {
  const d = DEVICES[type]
  return { id: ++uid, type, ...d, deadlineH, deadline: slotOfHour(deadlineH) || SLOTS, habit: slotOfHour(d.habitH) }
}

export type UserId = 'anais' | 'ines' | 'lily'

export const USERS: Record<UserId, Foyer> = {
  ines: { name: 'Inès', role: 'Habitante · offre Premium', share: 3, base: .5, cap: 6,
          tasks: [mkTask('voiture', 7), mkTask('linge', 22), mkTask('eau', 7), mkTask('vaisselle', 8)],
          types: ['voiture', 'linge', 'eau', 'vaisselle', 'secheLinge'] },
  lily: { name: 'Lily', role: 'Boulangerie · offre Pro', share: 10, base: 4, cap: 30,
          tasks: [mkTask('froid', 18), mkTask('utilitaire', 5), mkTask('eau', 4), mkTask('vaisselle', 20)],
          types: ['froid', 'utilitaire', 'eau', 'vaisselle'] },
  // Nouveau profil (absent de la maquette) : mêmes réglages qu'Inès, sans voiture électrique.
  anais: { name: 'Anaïs', role: 'Habitante · offre Gratuite', share: 3, base: .5, cap: 6,
           tasks: [mkTask('linge', 22), mkTask('eau', 7), mkTask('vaisselle', 8)],
           types: ['linge', 'eau', 'vaisselle', 'secheLinge'] },
}

export const DEADLINES = [10, 12, 14, 16, 18, 20, 22, 0, 2, 4, 6, 7, 8]
export const deadlineText = (h: number) => { const s = slotOfHour(h); return 'Avant ' + h + 'h' + ((s >= 32 || s === 0) ? ' demain' : '') }
