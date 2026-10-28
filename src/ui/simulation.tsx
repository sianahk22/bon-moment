import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { MUNI, PARAMS_DEFAUT, SLOTS, plan, quartierSim, type ScenarioId, type SimParams } from '../engine'

// État de la simulation, partagé par toute l'application (remplace le `state` global de la maquette).
function useEtatSimulation() {
  const [scenario, setScenario] = useState<ScenarioId>(PARAMS_DEFAUT.scenario)
  const [cloud, setCloud] = useState(PARAMS_DEFAUT.cloud)
  const [w, setW] = useState(PARAMS_DEFAUT.w)
  const [sim, setSim] = useState(PARAMS_DEFAUT.sim)
  const [coord, setCoord] = useState(true)
  const [slot, setSlot] = useState(10) // 13h
  const [lecture, setLecture] = useState(false)

  const params: SimParams = useMemo(() => ({ scenario, cloud, w, sim }), [scenario, cloud, w, sim])

  // Le moteur recalcule le quartier dès qu'un réglage change (scénario, nuage, simulateur…).
  const q = useMemo(() => ({ on: quartierSim(true, params), off: quartierSim(false, params) }), [params])
  const muni = useMemo(() => plan(MUNI, q.on.ctx, {
    solar: q.on.prod.map((p, i) => Math.max(0, p - q.on.cons[i])), baseLoad: q.on.cons, w,
  }), [q, w])

  // Lecture de la journée : 2 créneaux par seconde, comme dans la maquette (24 h en 24 s).
  useEffect(() => {
    if (!lecture) return
    const id = setInterval(() => setSlot(s => (s + 1) % SLOTS), 500)
    return () => clearInterval(id)
  }, [lecture])

  return { scenario, setScenario, cloud, setCloud, w, setW, sim, setSim, coord, setCoord, slot, setSlot, lecture, setLecture, params, q, muni }
}

export type Simulation = ReturnType<typeof useEtatSimulation>

const Contexte = createContext<Simulation | null>(null)

export function FournisseurSimulation({ children }: { children: ReactNode }) {
  const valeur = useEtatSimulation()
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>
}

export function useSimulation() {
  const s = useContext(Contexte)
  if (!s) throw new Error('useSimulation doit être utilisé dans <FournisseurSimulation>')
  return s
}
