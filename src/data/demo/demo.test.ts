// Vérifie que les données de démonstration sont stables et cohérentes.
import { describe, expect, it } from 'vitest'
import { CALENDRIER, JOURS_HISTORIQUE, historiqueDe, historiqueQuartier } from '.'

describe('données de démonstration', () => {
  it('60 jours d\'historique, identiques d\'un chargement à l\'autre', () => {
    const a = historiqueDe('ines')
    expect(a.jours).toHaveLength(JOURS_HISTORIQUE)
    expect(JSON.stringify(a.jours)).toMatchSnapshot()
  })

  it('respecte les règles Tempo : pas de jour rouge avant le 1er novembre, jamais le week-end', () => {
    for (const j of CALENDRIER) {
      if (j.tempo !== 'rouge') continue
      expect(j.date.getMonth() >= 10 || j.date.getMonth() <= 2).toBe(true)
      expect([0, 6]).not.toContain(j.date.getDay())
    }
  })

  it('l\'application fait gagner de l\'argent et du CO₂ sur la période', () => {
    for (const id of ['ines', 'anais', 'lily'] as const) {
      const h = historiqueDe(id)
      expect(h.jours.reduce((s, j) => s + j.economie, 0)).toBeGreaterThan(0)
      expect(h.jours.reduce((s, j) => s + j.co2Evite, 0)).toBeGreaterThan(0)
      expect(h.notifications.length).toBeGreaterThan(0)
    }
  })

  it('la moyenne du quartier est calculée pour chaque jour', () => {
    expect(historiqueQuartier()).toHaveLength(JOURS_HISTORIQUE)
  })
})
