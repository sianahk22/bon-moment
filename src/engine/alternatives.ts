import { slotScore, type Tache } from './moteur'
import type { SlotCtx } from './scenarios'

// Nouvelle fonction (ne modifie aucun calcul existant) : propose d'autres créneaux pour une tâche,
// quand l'utilisateur veut « déplacer » le créneau choisi par le moteur.
// On cherche les plages d'un seul tenant, avant l'échéance, les mieux notées par slotScore,
// en évitant deux propositions qui se chevauchent.
export function alternatives(t: Tache, ctx: SlotCtx[], solar: number[], baseLoad: number[], w: number, max = 3): number[][] {
  const candidats: { debut: number; score: number }[] = []
  for (let s = 0; s + t.dur <= t.deadline; s++) {
    let score = 0
    for (let j = s; j < s + t.dur; j++) score += slotScore(t.p, j, ctx, solar, baseLoad, { w })
    candidats.push({ debut: s, score })
  }
  candidats.sort((a, b) => a.score - b.score || a.debut - b.debut)
  const debuts: number[] = []
  for (const c of candidats) {
    if (debuts.every(d => Math.abs(d - c.debut) >= t.dur)) debuts.push(c.debut)
    if (debuts.length === max) break
  }
  return debuts.map(d => Array.from({ length: t.dur }, (_, j) => d + j))
}
