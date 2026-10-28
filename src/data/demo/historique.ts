import {
  PARAMS_DEFAUT, SLOTS, evaluate, habitSlots, label, plan, quartierSim, rangeText, rng, slotCtx,
  type SlotCtx, type TacheFoyer,
} from '../../engine'
import type { NomIcone } from '../../ui/Icone'
import { USERS, creerTache, type DeviceId, type UserId } from '../appareils'
import { CALENDRIER, JOURS_HISTORIQUE, jourCalendrier, type JourCalendrier } from './calendrier'
import { INVENTAIRES, type Appareil } from './inventaires'

// Historique de démonstration : 60 jours d'utilisation de l'application.
// Chaque journée passe par le VRAI moteur (plan + evaluate) avec le scénario Tempo du jour,
// puis on simule le comportement de la personne : moment accepté, décalé ou ignoré.
// Tirages pseudo-aléatoires à graine fixe : les données sont identiques à chaque chargement.

export type Statut = 'accepte' | 'decale' | 'ignore'

export interface MomentPasse {
  decalage: number
  appareilId: string
  nom: string
  icone: NomIcone
  auto: boolean
  statut: Statut
  debut: number // créneau de départ réellement utilisé
  creneau: string
  economie: number // € gagnés (ou perdus) par rapport à l'habitude
}

export interface JourHistorique {
  cal: JourCalendrier
  consoHoraire: number[] // 24 valeurs en kWh, de 8h à 8h
  kwhTotal: number
  kwhPilotes: number
  solaireKwh: number
  economie: number // €
  co2Evite: number // kg
  facture: number // €, coût de l'électricité de la journée
  factureSans: number // € si les appareils pilotables avaient tourné à l'heure habituelle
  pic: number // kW
  picSans: number // kW
  parAppareil: Record<string, number> // kWh par appareil
  moments: MomentPasse[]
}

export interface Notification {
  decalage: number
  heure: string
  texte: string
  ton: 'soleil' | 'reseau' | 'bon' | 'eviter'
}

export interface Historique {
  jours: JourHistorique[]
  notifications: Notification[]
  derniereUtilisation: Record<string, { decalage: number; heure: string }>
}

const W = PARAMS_DEFAUT.w
const GRAINES: Record<UserId, number> = { ines: 11, anais: 23, lily: 37 }
const ECHEANCES_SUPP: Partial<Record<DeviceId, number>> = { secheLinge: 23 }

// Les besoins du jour selon le personnage (les mêmes échéances que ses tâches dans le moteur).
function besoinsDuJour(userId: UserId, cal: JourCalendrier, r: () => number): DeviceId[] {
  if (userId === 'ines') {
    const b: DeviceId[] = ['eau']
    if (r() < .6) b.push('voiture')
    if (r() < .5) b.push('linge')
    if (r() < .85) b.push('vaisselle')
    if (r() < .25) b.push('secheLinge')
    return b
  }
  if (userId === 'anais') {
    const b: DeviceId[] = ['eau']
    if (r() < .45) b.push('linge')
    if (r() < .6) b.push('vaisselle')
    return b
  }
  // Boulangerie de Lily : fermée le lundi, donc pas de livraison ce jour-là
  const b: DeviceId[] = ['froid', 'eau', 'vaisselle']
  if (cal.date.getDay() !== 1) b.push('utilitaire')
  return b
}

function echeance(userId: UserId, type: DeviceId) {
  return USERS[userId].tasks.find(t => t.type === type)?.deadlineH ?? ECHEANCES_SUPP[type] ?? 8
}

const appareilDe = (inv: Appareil[], type: string) => inv.find(a => a.type === type)

// Décaler = l'utilisateur a repoussé le créneau d'une heure (sans dépasser l'échéance).
function decaler(slots: number[], t: TacheFoyer) {
  const max = Math.max(...slots)
  const pas = max + 2 < t.deadline ? 2 : -2
  return [...new Set(slots.map(i => Math.min(SLOTS - 1, Math.max(0, i + pas))))]
}

function journee(userId: UserId, cal: JourCalendrier, r: () => number): JourHistorique {
  const u = USERS[userId], inv = INVENTAIRES[userId]
  const ctx: SlotCtx[] = slotCtx(cal.scenario, cal.nuage, cal.ensoleillement)
  const taches = besoinsDuJour(userId, cal, r).map((type, k) => {
    const a = appareilDe(inv, type)
    return { ...creerTache(type, echeance(userId, type), k), auto: a ? a.connecte && a.auto : false }
  })
  const solar = ctx.map(c => u.share * c.sun)
  const opts = { solar, baseLoad: Array(SLOTS).fill(u.base), cap: u.cap, capW: 3, w: W }
  const planifie = plan(taches, ctx, opts)
  const habitudes = taches.map(habitSlots)

  const statuts: Statut[] = taches.map(t => {
    const x = r()
    if (t.auto) return x < .95 ? 'accepte' : 'ignore' // pilotage automatique : rarement annulé
    return x < .62 ? 'accepte' : x < .82 ? 'decale' : 'ignore' // simple rappel
  })
  const reel = taches.map((t, k) => statuts[k] === 'accepte' ? planifie[k] : statuts[k] === 'ignore' ? habitudes[k] : decaler(planifie[k], t))
  const avec = evaluate(taches, reel, ctx, solar)
  const sans = evaluate(taches, habitudes, ctx, solar)

  // Appareils seulement mesurés : leur profil moyen, avec une petite variation selon le jour.
  const variation = .85 + .3 * r()
  const mesures = inv.filter(a => a.profil)
  const fixe = ctx.map(c => mesures.reduce((s, a) => s + a.profil!(c.h) * variation, 0))
  const flexAvec = Array(SLOTS).fill(0), flexSans = Array(SLOTS).fill(0)
  taches.forEach((t, k) => { reel[k].forEach(i => flexAvec[i] += t.p); habitudes[k].forEach(i => flexSans[i] += t.p) })

  const coutFixe = fixe.reduce((s, kwMoy, i) => s + kwMoy * .5 * ctx[i].price, 0)
  const total = fixe.map((f, i) => f + flexAvec[i])
  const parAppareil: Record<string, number> = {}
  mesures.forEach(a => { parAppareil[a.id] = ctx.reduce((s, c) => s + a.profil!(c.h) * variation * .5, 0) })
  taches.forEach((t, k) => { const a = appareilDe(inv, t.type); if (a) parAppareil[a.id] = (parAppareil[a.id] ?? 0) + t.p * .5 * reel[k].length })

  return {
    cal,
    consoHoraire: Array.from({ length: 24 }, (_, j) => (total[2 * j] + total[2 * j + 1]) * .5),
    kwhTotal: total.reduce((s, v) => s + v * .5, 0),
    kwhPilotes: avec.kwh,
    solaireKwh: avec.sol,
    economie: sans.cost - avec.cost,
    co2Evite: (sans.co2 - avec.co2) / 1000,
    facture: coutFixe + avec.cost,
    factureSans: coutFixe + sans.cost,
    pic: Math.max(...fixe.map((f, i) => f + flexAvec[i] + u.base)),
    picSans: Math.max(...fixe.map((f, i) => f + flexSans[i] + u.base)),
    parAppareil,
    moments: taches.map((t, k) => ({
      decalage: cal.decalage,
      appareilId: appareilDe(inv, t.type)?.id ?? t.type,
      nom: t.name,
      icone: appareilDe(inv, t.type)?.icone ?? 'appareils',
      auto: t.auto,
      statut: statuts[k],
      debut: Math.min(...reel[k]),
      creneau: rangeText(reel[k]),
      economie: sans.per[k].cost - avec.per[k].cost,
    })),
  }
}

function notifications(jours: JourHistorique[]): Notification[] {
  const out: Notification[] = []
  for (const j of jours.slice(-5)) {
    if (j.cal.nuage) out.push({ decalage: j.cal.decalage, heure: '9h', texte: 'Nuage annoncé entre 11h30 et 15h30 : votre planning a été réorganisé.', ton: 'reseau' })
    for (const m of j.moments) {
      if (m.statut === 'ignore') continue
      out.push(m.auto
        ? { decalage: j.cal.decalage, heure: label(m.debut), texte: `Démarrage automatique : ${m.nom.toLowerCase()} (${m.creneau}).`, ton: 'bon' }
        : { decalage: j.cal.decalage, heure: label(m.debut), texte: `C'est le bon moment pour lancer : ${m.nom.toLowerCase()}.`, ton: 'soleil' })
    }
  }
  const demain = jourCalendrier(1)
  if (demain.tempo !== 'bleu') out.push({ decalage: 0, heure: '8h', texte: `Demain, jour ${demain.tempo} Tempo : vos appareils seront décalés vers les heures creuses.`, ton: 'eviter' })
  return out.reverse().slice(0, 8)
}

const cache = new Map<UserId, Historique>()

// Calculé une seule fois par personnage, au premier affichage.
export function historiqueDe(userId: UserId): Historique {
  const deja = cache.get(userId)
  if (deja) return deja
  const r = rng(GRAINES[userId])
  const jours = CALENDRIER.slice(0, JOURS_HISTORIQUE).map(cal => journee(userId, cal, r))
  const derniereUtilisation: Historique['derniereUtilisation'] = {}
  for (const j of jours) for (const m of j.moments) derniereUtilisation[m.appareilId] = { decalage: j.cal.decalage, heure: label(m.debut) }
  const h = { jours, notifications: notifications(jours), derniereUtilisation }
  cache.set(userId, h)
  return h
}

// Moyenne d'un foyer du quartier, jour par jour, calculée avec la simulation du quartier (30 foyers).
export interface JourQuartier {
  economieParFoyer: number // €
  co2ParFoyer: number // kg
  taux: number // part du soleil consommée sur place, avec coordination
  tauxSans: number
  economie: number // € pour tout le quartier
  co2: number // kg pour tout le quartier
  pic: number // kW sur le poste, avec coordination
  picSans: number
}
let cacheQuartier: JourQuartier[] | null = null
export function historiqueQuartier(): JourQuartier[] {
  if (cacheQuartier) return cacheQuartier
  cacheQuartier = CALENDRIER.slice(0, JOURS_HISTORIQUE).map(cal => {
    // Le quartier vit au rythme de la semaine : école fermée le week-end et pendant les vacances
    // de la Toussaint (du 17 octobre au 1er novembre, dates simulées), boulangerie fermée le lundi.
    const jour = cal.date.getDay()
    const vacances = cal.date >= new Date(2026, 9, 17) && cal.date <= new Date(2026, 10, 1)
    const sim = { ecole: jour !== 0 && jour !== 6 && !vacances, boulangerie: jour !== 1, parking: false }
    const params = { ...PARAMS_DEFAUT, scenario: cal.scenario, cloud: cal.nuage, sim, ensoleillement: cal.ensoleillement }
    const on = quartierSim(true, params), off = quartierSim(false, params)
    const economie = off.cost - on.cost, co2 = (off.co2 - on.co2) / 1000
    return { economieParFoyer: economie / 30, co2ParFoyer: co2 / 30, taux: on.taux, tauxSans: off.taux, economie, co2, pic: on.peak, picSans: off.peak }
  })
  return cacheQuartier
}
