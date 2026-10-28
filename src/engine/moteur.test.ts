// Vérifie que le moteur TypeScript donne exactement les mêmes chiffres que reference/moteur-base.js.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { calculer, type Foyer, type ScenarioId, type SimParams } from '.'
import { USERS, mkTask, type DeviceId } from '../data/appareils'

// Charge une copie neuve du code de référence (il n'exporte rien : on lui fait renvoyer ce dont on a besoin).
function chargerReference() {
  const code = readFileSync('reference/moteur-base.js', 'utf8')
  return new Function(code + '\nreturn { state, compute, USERS, mkTask };')() as any
}

// Lance la référence avec les réglages donnés et renvoie ses résultats.
function calculerReference(params: SimParams, user: 'ines' | 'lily', ajout?: [DeviceId, number], retrait?: number) {
  const ref = chargerReference()
  Object.assign(ref.state, { scenario: params.scenario, cloud: params.cloud, w: params.w, sim: params.sim, user })
  if (ajout) ref.USERS[user].tasks.push(ref.mkTask(ajout[0], ajout[1]))
  if (retrait !== undefined) ref.USERS[user].tasks.splice(retrait, 1)
  ref.compute()
  return ref.state
}

function comparer(params: SimParams, user: 'ines' | 'lily', ajout?: [DeviceId, number], retrait?: number) {
  const attendu = calculerReference(params, user, ajout, retrait)
  const tasks = [...USERS[user].tasks]
  if (ajout) tasks.push(mkTask(ajout[0], ajout[1]))
  if (retrait !== undefined) tasks.splice(retrait, 1)
  const foyer: Foyer = { ...USERS[user], tasks }
  const obtenu = calculer(params, foyer)

  expect(obtenu.q.on).toEqual(attendu.q.on)
  expect(obtenu.q.off).toEqual(attendu.q.off)
  expect(obtenu.f.slots).toEqual(attendu.f.slots)
  expect(obtenu.f.habits).toEqual(attendu.f.habits)
  expect(obtenu.f.solar).toEqual(attendu.f.solar)
  expect(obtenu.f.planned).toEqual(attendu.f.planned)
  expect(obtenu.f.naive).toEqual(attendu.f.naive)
  expect(obtenu.m).toEqual(attendu.m)
}

const SIM_DEFAUT = { ecole: true, boulangerie: true, parking: false }
const scenarios: ScenarioId[] = ['ete', 'hiver', 'rouge']

describe('moteur identique à la référence', () => {
  for (const scenario of scenarios) {
    for (const cloud of [false, true]) {
      for (const w of [0, .35, 1]) {
        for (const user of ['ines', 'lily'] as const) {
          it(`${scenario} · nuage ${cloud ? 'oui' : 'non'} · w=${w} · ${user}`, () => {
            comparer({ scenario, cloud, w, sim: SIM_DEFAUT }, user)
          })
        }
      }
    }
  }

  it('simulateur : ombrières du parking, sans école ni boulangerie', () => {
    comparer({ scenario: 'ete', cloud: false, w: .35, sim: { ecole: false, boulangerie: false, parking: true } }, 'ines')
    comparer({ scenario: 'hiver', cloud: true, w: .35, sim: { ecole: true, boulangerie: false, parking: true } }, 'lily')
  })

  it('parcours de démo : ajout de « Voiture chargée pour 7 h »', () => {
    comparer({ scenario: 'ete', cloud: false, w: .35, sim: SIM_DEFAUT }, 'ines', ['voiture', 7])
    comparer({ scenario: 'rouge', cloud: true, w: .35, sim: SIM_DEFAUT }, 'ines', ['voiture', 7])
  })

  it('retrait d\'un besoin', () => {
    comparer({ scenario: 'hiver', cloud: false, w: .35, sim: SIM_DEFAUT }, 'ines', undefined, 0)
  })
})

describe('Anaïs (nouveau profil)', () => {
  it('toutes ses échéances sont tenues', () => {
    const { f } = calculer({ scenario: 'ete', cloud: false, w: .35, sim: SIM_DEFAUT }, USERS.anais)
    USERS.anais.tasks.forEach((t, k) => {
      expect(f.slots[k]).toHaveLength(t.dur)
      expect(Math.max(...f.slots[k])).toBeLessThan(t.deadline)
    })
    expect(f.planned.cost).toBeLessThanOrEqual(f.naive.cost)
  })
})
