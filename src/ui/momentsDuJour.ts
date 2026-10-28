import { useMemo } from 'react'
import { PARAMS_DEFAUT, SCENARIOS, SLOTS, qualiteCreneaux, quartierSim, rangeText, type SimParams } from '../engine'
import { USERS, type UserId } from '../data/appareils'

// Prépare les données de l'arc du soleil à partir du moteur, pour un foyer ou pour tout le quartier.
export function momentsDuJour(userId: UserId | undefined, params: SimParams = PARAMS_DEFAUT) {
  const q = quartierSim(true, params)
  const ctx = q.ctx
  let solar: number[], baseLoad: number[]
  if (userId) {
    const u = USERS[userId]
    solar = ctx.map(c => u.share * c.sun)
    baseLoad = Array(SLOTS).fill(u.base)
  } else {
    // Vue Ville : soleil restant une fois la consommation de base du quartier servie.
    solar = q.prod.map((p, i) => Math.max(0, p - q.base[i]))
    baseLoad = q.base
  }
  const qualites = qualiteCreneaux(ctx, solar, baseLoad, params.w)
  const maxSun = Math.max(0.001, ...ctx.map(c => c.sun))
  const bons = qualites.flatMap((qu, i) => (qu === 'bon' ? [i] : []))
  return {
    scenario: SCENARIOS[params.scenario],
    soleil: ctx.map(c => c.sun / maxSun),
    qualites,
    bonsTexte: rangeText(bons),
    picProduction: Math.max(...q.prod),
    quartier: q,
  }
}

export function useMomentsDuJour(userId: UserId | undefined, params: SimParams = PARAMS_DEFAUT) {
  return useMemo(() => momentsDuJour(userId, params), [userId, params])
}
