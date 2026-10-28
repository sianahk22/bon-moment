import { rng, type ScenarioId } from '../../engine'

// « Aujourd'hui » dans la démo est fixe, pour que la présentation soit identique à chaque fois.
export const DATE_DEMO = new Date(2026, 9, 29) // jeudi 29 octobre 2026
export const JOURS_HISTORIQUE = 60
export const JOURS_PREVISION = 6

export type Tempo = 'bleu' | 'blanc' | 'rouge'

export interface JourCalendrier {
  decalage: number // 0 = aujourd'hui, -1 = hier, +1 = demain
  date: Date
  tempo: Tempo
  scenario: ScenarioId
  nuage: boolean
  ensoleillement: number // 1 = soleil du scénario ; baisse avec l'automne, varie chaque jour
}

// Chaque couleur Tempo utilise l'un des 3 scénarios du moteur (prix réels + courbes simulées).
const SCENARIO_TEMPO: Record<Tempo, ScenarioId> = { bleu: 'ete', blanc: 'hiver', rouge: 'rouge' }

// Règles Tempo réelles : jours rouges seulement du 1er novembre au 31 mars, jamais le week-end ;
// pas de jour blanc le dimanche. Les proportions sont simulées.
function tempoDuJour(date: Date, r: () => number): Tempo {
  const mois = date.getMonth(), jour = date.getDay()
  const saisonRouge = mois >= 10 || mois <= 2
  const x = r()
  if (saisonRouge && jour !== 0 && jour !== 6 && x < .1) return 'rouge'
  if (jour !== 0 && x < (saisonRouge ? .3 : .12)) return 'blanc'
  return 'bleu'
}

export const CALENDRIER: JourCalendrier[] = (() => {
  const r = rng(2026), out: JourCalendrier[] = []
  for (let d = -JOURS_HISTORIQUE; d <= JOURS_PREVISION; d++) {
    const date = new Date(DATE_DEMO)
    date.setDate(date.getDate() + d)
    const tempo = tempoDuJour(date, r)
    const nuage = r() < .25
    // Automne : le soleil baisse d'environ 35 % entre fin août et fin octobre, avec une variation quotidienne.
    const saison = 1 - .35 * (d + JOURS_HISTORIQUE) / JOURS_HISTORIQUE
    const ensoleillement = Math.max(.4, saison * (.82 + .3 * r()))
    // Aujourd'hui suit les réglages de la barre du haut (Été · jour bleu par défaut).
    out.push(d === 0 ? { decalage: 0, date, tempo: 'bleu', scenario: 'ete', nuage: false, ensoleillement: 1 } : { decalage: d, date, tempo, scenario: SCENARIO_TEMPO[tempo], nuage, ensoleillement })
  }
  return out
})()

export const jourCalendrier = (decalage: number) => CALENDRIER[decalage + JOURS_HISTORIQUE]

const FORMAT_JOUR = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
export const formatJour = (date: Date) => FORMAT_JOUR.format(date)
export const nomJour = (decalage: number, date: Date) =>
  decalage === 0 ? 'Aujourd\'hui' : decalage === 1 ? 'Demain' : decalage === -1 ? 'Hier' : formatJour(date)
