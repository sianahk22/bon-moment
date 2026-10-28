import { SLOTS } from './base'
import { evaluate, habitSlots, plan, type Tache } from './moteur'
import { MUNI, quartierSim, type SimParams } from './quartier'

// Une tâche d'un foyer ou d'une entreprise (créée par mkTask dans src/data/appareils.ts).
export interface TacheFoyer extends Tache {
  id: number
  type: string
  name: string
  detail: string
  auto: boolean // true = lancé automatiquement, false = simple rappel
  habitH: number
  deadlineH: number
  habit: number
}

export interface Foyer {
  name: string
  role: string
  share: number // part du soleil du quartier réservée à ce foyer (kW crête)
  base: number // consommation de fond (kW)
  cap: number // puissance maximale souhaitée (kW)
  tasks: TacheFoyer[]
  types: string[] // appareils proposés à l'ajout
}

// Calcul global : remplace compute(). Rien n'est modifié, tout est renvoyé.
export function calculer(params: SimParams, u: Foyer) {
  const q = { on: quartierSim(true, params), off: quartierSim(false, params) }
  const ctx = q.on.ctx
  const solar = ctx.map(c => u.share * c.sun)
  const opts = { solar, baseLoad: Array(SLOTS).fill(u.base), cap: u.cap, capW: 3, w: params.w }
  const slots = plan(u.tasks, ctx, opts)
  const habits = u.tasks.map(habitSlots)
  const f = { u, ctx, solar, opts, slots, habits, planned: evaluate(u.tasks, slots, ctx, solar), naive: evaluate(u.tasks, habits, ctx, solar) }
  const m = plan(MUNI, ctx, { solar: q.on.prod.map((p, i) => Math.max(0, p - q.on.cons[i])), baseLoad: q.on.cons, w: params.w })
  return { q, f, m }
}

export type Resultat = ReturnType<typeof calculer>
