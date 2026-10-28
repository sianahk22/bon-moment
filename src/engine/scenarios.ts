import { SLOTS, bump, hourOf, isHC } from './base'

export type ScenarioId = 'ete' | 'hiver' | 'rouge'

export interface Scenario {
  nom: string
  tempo: string
  hp: number // prix heures pleines (€/kWh TTC)
  hc: number // prix heures creuses (€/kWh TTC)
  sun: { peak: number; rise: number; set: number }
  co2: (h: number) => number
  tension: (h: number) => number
}

// Ce qu'on sait d'un créneau : heure, prix, CO2 (g/kWh), tension du réseau (0 à 1), soleil (0 à 1).
export interface SlotCtx { h: number; price: number; co2: number; tension: number; sun: number }

// Tarifs Tempo réels (TTC, 1er août 2026). Courbes CO2, soleil et tension : simulées.
export const SCENARIOS: Record<ScenarioId, Scenario> = {
  ete:   { nom: 'Été ensoleillé', tempo: 'Jour bleu', hp: .1654, hc: .1356, sun: { peak: 1, rise: 6, set: 21.5 },
           co2: h => 22 + 35 * bump(h, 19.5, 2) + 8 * bump(h, 8, 1.5), tension: () => 0 },
  hiver: { nom: 'Hiver', tempo: 'Jour blanc', hp: .1921, hc: .1536, sun: { peak: .32, rise: 8.5, set: 17.3 },
           co2: h => 40 + 55 * bump(h, 19, 1.6) + 30 * bump(h, 9, 1.6), tension: h => (h >= 8 && h < 13) ? .5 : (h >= 18 && h < 20) ? 1 : 0 },
  rouge: { nom: 'Hiver tendu', tempo: 'Jour rouge', hp: .7295, hc: .1615, sun: { peak: .28, rise: 8.6, set: 17.2 },
           co2: h => 55 + 75 * bump(h, 19, 1.6) + 40 * bump(h, 9, 1.6), tension: h => (h >= 6 && h < 22) ? (((h >= 8 && h < 13) || (h >= 18 && h < 20)) ? 1 : .5) : 0 },
}

// `cloud` remplace state.cloud : le nuage divise le soleil par ~3 entre 11h30 et 15h30.
// `ensoleillement` (ajout signalé, absent de la maquette) : météo du jour, 1 = comme la maquette.
export function sunAt(h: number, sc: Scenario, cloud: boolean, ensoleillement = 1) {
  const { peak, rise, set } = sc.sun
  if (h < rise || h > set) return 0
  let v = peak * Math.pow(Math.sin(Math.PI * (h - rise) / (set - rise)), 1.4)
  if (cloud && h >= 11.5 && h < 15.5) v *= 0.3
  return v * ensoleillement
}

export function slotCtx(scenario: ScenarioId, cloud: boolean, ensoleillement = 1): SlotCtx[] {
  const sc = SCENARIOS[scenario]
  return Array.from({ length: SLOTS }, (_, i) => {
    const h = (hourOf(i) + 0.25) % 24
    return { h, price: isHC(h) ? sc.hc : sc.hp, co2: sc.co2(h), tension: sc.tension(h), sun: sunAt(h, sc, cloud, ensoleillement) }
  })
}
