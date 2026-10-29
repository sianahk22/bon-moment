import { useCallback, useMemo, useState } from 'react'
import { USERS, mkTask, type DeviceId, type UserId } from '../data/appareils'
import { AVEC_FOND, INVENTAIRES, LIMITE_GRATUIT, consommationFixe, historiqueDe, historiqueQuartier, jourCalendrier, type Appareil, type JourCalendrier } from '../data/demo'
import {
  alternatives, calculerFoyer, evaluate, qualiteCreneaux, slotCtx,
  type Foyer, type Qualite, type ResultatFoyer, type SlotCtx, type TacheFoyer,
} from '../engine'
import { useSimulation } from '../ui/simulation'

// Une journée planifiée par le moteur, avec les choix de l'utilisateur (créneau déplacé, validé).
export interface JourPlanifie {
  cal: JourCalendrier
  ctx: SlotCtx[]
  f: ResultatFoyer
  taches: TacheFoyer[]
  options: number[][][] // pour chaque tâche : [créneau du moteur, alternatives…]
  reel: number[][] // créneaux retenus
  bilan: ReturnType<typeof evaluate>
  qualites: Qualite[]
}

export const cle = (decalage: number, t: TacheFoyer, k: number) => `${decalage}-${t.id}-${k}`

function planifierJour(cal: JourCalendrier, ctx: SlotCtx[], foyer: Foyer, w: number, choix: Record<string, number>): JourPlanifie {
  const f = calculerFoyer(ctx, foyer, w, true)
  const options = foyer.tasks.map((t, k) => {
    const autres = alternatives(t, ctx, f.solar, f.opts.baseLoad, w).filter(s => s.join() !== f.slots[k].join())
    return [f.slots[k], ...autres].slice(0, 3)
  })
  const reel = foyer.tasks.map((t, k) => options[k][choix[cle(cal.decalage, t, k)] ?? 0] ?? f.slots[k])
  return {
    cal, ctx, f, taches: foyer.tasks, options, reel,
    bilan: evaluate(foyer.tasks, reel, ctx, f.solar),
    qualites: qualiteCreneaux(ctx, f.solar, f.opts.baseLoad, w),
  }
}

// État d'un espace Particulier ou Entreprise : appareils, besoins du jour, semaine, historique.
export function useFoyer(userId: UserId, gratuit: boolean) {
  const sim = useSimulation()
  // Pour la boulangerie, le moteur connaît la consommation des fours (voir consommationFixe).
  const u = useMemo(() => (AVEC_FOND.includes(userId) ? { ...USERS[userId], fond: consommationFixe(userId, USERS[userId].base) } : USERS[userId]), [userId])
  const [appareils, setAppareils] = useState<Appareil[]>(() => INVENTAIRES[userId].map(a => ({ ...a })))
  // Inès : la voiture fait partie de ses habitudes (semaine, historique), mais la liste du jour
  // commence sans elle, pour que « Voiture chargée pour 7 h » soit ajoutée pendant la démo.
  const [taches, setTaches] = useState<TacheFoyer[]>(() => u.tasks.filter(t => !(userId === 'ines' && t.type === 'voiture')))
  const [choix, setChoix] = useState<Record<string, number>>({})
  const [valides, setValides] = useState<Record<string, boolean>>({})
  const [limiteAtteinte, setLimiteAtteinte] = useState(false)

  const historique = useMemo(() => historiqueDe(userId), [userId])
  const quartier = useMemo(() => historiqueQuartier(), [])
  // Économie estimée sur un an : moyenne des 60 jours d'historique × 365.
  const economieAnnuelle = useMemo(() => historique.jours.reduce((s, j) => s + j.economie, 0) / historique.jours.length * 365, [historique])

  // Une tâche est automatique si son appareil est connecté et en mode automatique, sinon c'est un rappel.
  const avecMode = useCallback((liste: TacheFoyer[]) => liste.map(t => {
    const a = appareils.find(x => x.type === t.type)
    return { ...t, auto: a ? a.connecte && a.auto : false }
  }), [appareils])

  // Aujourd'hui : suit les réglages de la barre du haut (scénario, nuage).
  const aujourdhui = useMemo(() => planifierJour(
    { ...jourCalendrier(0), scenario: sim.scenario, nuage: sim.cloud }, sim.q.on.ctx, { ...u, tasks: avecMode(taches) }, sim.w, choix,
  ), [u, taches, avecMode, sim.q, sim.scenario, sim.cloud, sim.w, choix])

  // Les 6 jours suivants : prévision Tempo et météo du calendrier de démonstration.
  const semaine = useMemo(() => [aujourdhui, ...[1, 2, 3, 4, 5, 6].map(d => {
    const cal = jourCalendrier(d)
    return planifierJour(cal, slotCtx(cal.scenario, cal.nuage, cal.ensoleillement), { ...u, tasks: avecMode(u.tasks) }, sim.w, choix)
  })], [aujourdhui, u, avecMode, sim.w, choix])

  const connectes = appareils.filter(a => a.type && a.connecte).length

  function basculerAuto(id: string) {
    const a = appareils.find(x => x.id === id)
    if (!a?.type) return
    const active = !(a.connecte && a.auto)
    if (active && !a.connecte && gratuit && connectes >= LIMITE_GRATUIT) { setLimiteAtteinte(true); return }
    setLimiteAtteinte(false)
    setAppareils(liste => liste.map(x => x.id !== id ? x : { ...x, auto: active, connecte: gratuit ? active : true }))
  }

  return {
    u, appareils, connectes, limiteAtteinte, setLimiteAtteinte, basculerAuto,
    taches, aujourdhui, semaine, historique, quartier, valides, economieAnnuelle,
    ajouter: (type: DeviceId, echeanceH: number) => setTaches(l => [...l, mkTask(type, echeanceH)]),
    retirer: (id: number) => setTaches(l => l.filter(t => t.id !== id)),
    deplacer: (j: JourPlanifie, k: number) => {
      const c = cle(j.cal.decalage, j.taches[k], k)
      setChoix(x => ({ ...x, [c]: ((x[c] ?? 0) + 1) % j.options[k].length }))
      setValides(v => ({ ...v, [c]: false }))
    },
    valider: (j: JourPlanifie, k: number) => {
      const c = cle(j.cal.decalage, j.taches[k], k)
      setValides(v => ({ ...v, [c]: !v[c] }))
    },
  }
}

export type EtatFoyer = ReturnType<typeof useFoyer>
