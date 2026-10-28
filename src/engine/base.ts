// Temps : 48 créneaux de 30 min, de 8h aujourd'hui à 8h demain.
// Code repris de reference/moteur-base.js : ne pas changer un calcul sans le signaler.
export const SLOTS = 48
export const hourOf = (i: number) => (8 + i / 2) % 24
export const label = (i: number) => { const m = (8 * 60 + i * 30) % 1440; const h = Math.floor(m / 60); return h + 'h' + (m % 60 ? '30' : '') }
export const slotOfHour = (h: number) => ((h - 8 + 24) % 24) * 2 // 7h demain -> 46
export const euro = (v: number) => v.toFixed(2).replace('.', ',') + ' €'
export const pct = (v: number) => Math.round(v * 100) + ' %'
export const kw = (v: number) => Math.round(v) + ' kW'
export const ACC_PRICE = 0.11 // prix de l'électricité solaire partagée (hypothèse de démo)
export const CAP = 60 // capacité du poste du quartier (démo)

export function bump(h: number, c: number, w: number) { let d = Math.abs(h - c); d = Math.min(d, 24 - d); return Math.exp(-(d * d) / (2 * w * w)) }
export const isHC = (h: number) => h >= 22 || h < 6
