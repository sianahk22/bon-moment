import { slotScore } from './moteur'
import type { SlotCtx } from './scenarios'

export type Qualite = 'bon' | 'neutre' | 'eviter'

// Même règle que le planning de la maquette (heat-good / heat-warn / heat-bad) :
// le tiers des créneaux les mieux notés est « bon », le tiers le moins bien noté est « à éviter ».
export function qualiteCreneaux(ctx: SlotCtx[], solar: number[], baseLoad: number[], w: number): Qualite[] {
  const scores = ctx.map((_, i) => slotScore(1, i, ctx, solar, baseLoad, { w }))
  const sorted = scores.slice().sort((a, b) => a - b), t1 = sorted[16], t2 = sorted[32]
  return scores.map(v => v <= t1 ? 'bon' : v <= t2 ? 'neutre' : 'eviter')
}
