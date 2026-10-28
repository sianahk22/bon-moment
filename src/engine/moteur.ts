import { ACC_PRICE, SLOTS, label } from './base'
import type { SlotCtx } from './scenarios'

// Une tâche flexible : puissance p (kW), durée dur (créneaux), échéance deadline (indice de créneau exclu).
export interface Tache {
  p: number
  dur: number
  deadline: number
  interruptible: boolean
  habit?: number // créneau de départ habituel, sans l'application
}

export interface PlanOptions {
  solar: number[] // soleil local encore disponible par créneau (kW)
  baseLoad: number[] // consommation déjà présente par créneau (kW)
  w: number // 0 = économies, 1 = écologie
  cap?: number // capacité à ne pas dépasser (kW)
  capW?: number // poids de la pénalité de dépassement
}

export interface Bilan {
  cost: number
  co2: number
  sol: number
  kwh: number
  per: { cost: number; co2: number; sol: number }[]
}

// Le moteur : optimisation sous contraintes (version gloutonne pour la démo)
export function slotScore(p: number, i: number, ctx: SlotCtx[], solar: number[], load: number[], o: Pick<PlanOptions, 'w' | 'cap' | 'capW'>) {
  const c = ctx[i]
  const loc = Math.min(p, Math.max(0, solar[i]))
  const cost = (loc * ACC_PRICE + (p - loc) * c.price) / p
  const co2 = ((p - loc) * c.co2) / p
  let s = (1 - o.w) * (cost / 0.73) + o.w * (co2 / 150) + 0.25 * c.tension
  // capW est toujours fourni avec cap (comme dans la référence).
  if (o.cap && load[i] + p > o.cap) s += o.capW! * (load[i] + p - o.cap) / p
  return s
}

export function plan(tasks: Tache[], ctx: SlotCtx[], o: PlanOptions): number[][] {
  const solar = o.solar.slice(), load = o.baseLoad.slice(), out: number[][] = []
  // Number() : en JavaScript, true - false vaut déjà 1 ; TypeScript demande seulement de l'écrire explicitement.
  const order = tasks.map((_, k) => k).sort((a, b) =>
    (Number(tasks[a].interruptible) - Number(tasks[b].interruptible)) || ((tasks[a].deadline - tasks[a].dur) - (tasks[b].deadline - tasks[b].dur)) || (tasks[b].p - tasks[a].p))
  for (const k of order) {
    const t = tasks[k], sc = (i: number) => slotScore(t.p, i, ctx, solar, load, o)
    let slots: number[]
    if (!t.interruptible) {
      let best = 0, bs = Infinity
      for (let s = 0; s + t.dur <= t.deadline; s++) {
        let sum = 0; for (let j = s; j < s + t.dur; j++) sum += sc(j)
        if (sum < bs - 1e-9) { bs = sum; best = s }
      }
      slots = Array.from({ length: t.dur }, (_, j) => best + j)
    } else {
      slots = [...Array(t.deadline).keys()].sort((a, b) => sc(a) - sc(b) || a - b).slice(0, t.dur).sort((a, b) => a - b)
    }
    for (const i of slots) { const loc = Math.min(t.p, Math.max(0, solar[i])); solar[i] -= loc; load[i] += t.p }
    out[k] = slots
  }
  return out
}

export const habitSlots = (t: { dur: number; habit: number }) => Array.from({ length: t.dur }, (_, j) => Math.min(SLOTS - 1, t.habit + j))

export function evaluate(tasks: Tache[], slotsArr: number[][], ctx: SlotCtx[], solarInit: number[]): Bilan {
  const solar = solarInit.slice(); let cost = 0, co2 = 0, sol = 0, kwh = 0; const per: Bilan['per'] = []
  tasks.forEach((t, k) => {
    let c = 0, g = 0, s = 0
    for (const i of slotsArr[k]) {
      const e = t.p * .5, loc = Math.min(t.p, Math.max(0, solar[i]))
      solar[i] -= loc; const le = loc * .5, ge = e - le
      c += le * ACC_PRICE + ge * ctx[i].price; g += ge * ctx[i].co2; s += le; kwh += e
    }
    cost += c; co2 += g; sol += s; per[k] = { cost: c, co2: g, sol: s }
  })
  return { cost, co2, sol, kwh, per }
}

// Regroupe des créneaux consécutifs en plages [début, fin]. (-1 = « pas encore de plage », les créneaux sont toujours ≥ 0.)
export function ranges(slots: number[]): [number, number][] {
  const r: [number, number][] = []; let a = -1, b = -1
  for (const i of slots) { if (a === -1) { a = b = i } else if (i === b + 1) { b = i } else { r.push([a, b]); a = b = i } }
  if (a !== -1) r.push([a, b])
  return r
}
export const rangeText = (slots: number[]) => ranges(slots).map(([a, b]) => label(a) + '–' + label(b + 1)).join(', ')
