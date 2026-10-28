import { useMemo } from 'react'
import { CALENDRIER, JOURS_HISTORIQUE, formatJour, historiqueQuartier, jourCalendrier, nomJour } from '../data/demo'
import { SLOTS, euro, kw, label, pct, qualiteCreneaux, quartierSim, ranges, type Qualite, type Quartier } from '../engine'
import { TempoPuce, kg, nombre } from '../espace/commun'
import { Kpi, Panneau, Pastille } from '../ui/composants'
import { useSimulation } from '../ui/simulation'

// Bons moments du quartier : la même règle que pour les habitants, appliquée au soleil restant du gymnase.
function momentsQuartier(q: Quartier, w: number) {
  const solar = q.prod.map((p, i) => Math.max(0, p - q.base[i]))
  const qualites = qualiteCreneaux(q.ctx, solar, q.base, w)
  const plages = (x: Qualite) => ranges(qualites.flatMap((v, i) => (v === x ? [i] : []))).sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]))
  return { qualites, bons: plages('bon'), aEviter: plages('eviter') }
}
const plage = ([a, b]: [number, number]) => `${label(a)}–${label(b + 1)}`

export default function EcranVilleMoments() {
  const s = useSimulation()
  const { on, off } = s.q
  const auj = useMemo(() => momentsQuartier(on, s.w), [on, s.w])
  const calDemain = jourCalendrier(1)
  const demain = useMemo(() => momentsQuartier(quartierSim(true, { ...s.params, scenario: calDemain.scenario, cloud: calDemain.nuage, ensoleillement: calDemain.ensoleillement }), s.w), [s.params, calDemain, s.w])

  // Énergie que la coordination a déplacée d'un créneau à un autre aujourd'hui.
  const deplaces = on.flex.reduce((t, v, i) => t + Math.max(0, v - off.flex[i]) * .5, 0)
  const histo = historiqueQuartier().slice(-7).map((h, i) => ({ h, cal: CALENDRIER[JOURS_HISTORIQUE - 7 + i] })).reverse()

  return (
    <div className="ecran">
      <div className="ecran__kpis">
        <Panneau><Kpi libelle="Meilleur moment aujourd'hui" valeur={auj.bons[0] ? plage(auj.bons[0]) : '–'} ton="bon" note="soleil du gymnase disponible" /></Panneau>
        <Panneau><Kpi libelle="Moment à éviter" valeur={auj.aEviter[0] ? plage(auj.aEviter[0]) : '–'} ton="eviter" note="pic du soir sur le poste" /></Panneau>
        <Panneau><Kpi libelle="Énergie déplacée" valeur={nombre(deplaces)} unite="kWh" ton="soleil" note="par la coordination, aujourd'hui" /></Panneau>
        <Panneau><Kpi libelle="Pic évité sur le poste" valeur={kw(off.peak - on.peak).replace(' kW', '')} unite="kW" ton="reseau" note={`${kw(on.peak)} au lieu de ${kw(off.peak)}`} /></Panneau>
      </div>

      <Panneau titre="Aujourd'hui dans le quartier, de 8h à 8h" icone="moments" action={
        <div className="legende"><Pastille ton="bon">Bon moment</Pastille><Pastille ton="eviter">À éviter</Pastille><Pastille ton="soleil">Production solaire</Pastille></div>
      }>
        <BandeMoments qualites={auj.qualites} production={on.prod} maintenant={s.slot} />
        <p className="texte-2 ville-moments__liste">
          Bons moments : <b className="chiffre">{auj.bons.slice(0, 3).map(plage).join(' · ') || '–'}</b>
        </p>
      </Panneau>

      <div className="ecran__colonnes">
        <Panneau titre={`Demain · ${formatJour(calDemain.date)}`} icone="moments" action={<TempoPuce tempo={calDemain.tempo} nuage={calDemain.nuage} />}>
          <BandeMoments qualites={demain.qualites} />
          <p className="texte-2 ville-moments__liste">
            Le Bon Moment proposera aux habitants : <b className="chiffre">{demain.bons.slice(0, 2).map(plage).join(' · ') || '–'}</b>
            {calDemain.tempo !== 'bleu' && <> · jour {calDemain.tempo} Tempo : les heures pleines coûtent plus cher</>}
          </p>
        </Panneau>

        <Panneau titre="Les 7 derniers jours" icone="bilan">
          <ul className="historique">
            {histo.map(({ h, cal }) => (
              <li key={cal.decalage} className="historique--ville">
                <span className="historique__quand">{nomJour(cal.decalage, cal.date)}</span>
                <TempoPuce tempo={cal.tempo} nuage={cal.nuage} />
                <span className="chiffre">{pct(h.taux)} <small className="texte-2">soleil</small></span>
                <span className="chiffre bon">−{euro(h.economie)}</span>
                <span className="chiffre texte-2">{kg(h.co2)}</span>
              </li>
            ))}
          </ul>
        </Panneau>
      </div>
    </div>
  )
}

// Bande horizontale des 48 créneaux : couleur du moment, et en option la production solaire.
function BandeMoments({ qualites, production, maintenant }: { qualites: Qualite[]; production?: number[]; maintenant?: number }) {
  const W = 960, pl = 4, pr = 4, H = production ? 96 : 50
  const x = (i: number) => pl + (W - pl - pr) * i / SLOTS, cw = (W - pl - pr) / SLOTS
  const max = production ? Math.max(1, ...production) : 1
  const yBande = production ? 56 : 8
  return (
    <svg className="timeline" viewBox={`0 0 ${W} ${H + 18}`} role="img" aria-label="Bons moments et moments à éviter sur 24 heures">
      {production && <path className="t-soleil" d={`M${x(0)} 48 ${production.map((v, i) => `L${(x(i) + cw / 2).toFixed(1)} ${(48 - 42 * v / max).toFixed(1)}`).join(' ')} L${x(SLOTS)} 48 Z`} />}
      {qualites.map((q, i) => <rect key={i} className={`t-${q}`} x={x(i) + .5} y={yBande} width={cw - 1} height={30} rx={3} />)}
      {maintenant !== undefined && <line className="t-maintenant" x1={x(maintenant + .5)} x2={x(maintenant + .5)} y1={2} y2={yBande + 34} />}
      {[0, 8, 16, 24, 32, 40, 48].map(i => <text key={i} className="t-axe" x={Math.min(W - 14, Math.max(14, x(i)))} y={H + 14} textAnchor="middle">{label(i % SLOTS)}</text>)}
    </svg>
  )
}
