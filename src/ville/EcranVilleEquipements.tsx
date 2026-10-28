import { MUNI, euro, kw, label, pct, rangeText } from '../engine'
import { Kpi, Panneau } from '../ui/composants'
import Icone, { type NomIcone } from '../ui/Icone'
import { useSimulation } from '../ui/simulation'

const SIMULATEUR: { cle: 'ecole' | 'boulangerie' | 'parking'; nom: string; detail: string; icone: NomIcone }[] = [
  { cle: 'ecole', nom: 'École Jules-Ferry', detail: 'Consomme en journée, quand le soleil produit', icone: 'mairie' },
  { cle: 'boulangerie', nom: 'Boulangerie de Lily', detail: 'Fours et chambre froide dès 4 h du matin', icone: 'boutique' },
  { cle: 'parking', nom: 'Ombrières solaires du parking', detail: '+30 kWc de panneaux sur le parking', icone: 'soleil' },
]

const ICONES_MUNI: NomIcone[] = ['eau', 'mairie', 'utilitaire']

export default function EcranVilleEquipements() {
  const s = useSimulation()
  const { on, off } = s.q
  const i = s.slot
  // Part de soleil local des bornes à l'heure affichée (même règle que la maquette).
  const local = on.cons[i] ? Math.min(on.prod[i], on.cons[i]) / on.cons[i] : 0
  const bornes: [string, number, number][] = [['Parking de la mairie', local, 2], ['École Jules-Ferry', local * .92, 1], ['Place du marché', local * .8, 3]]

  return (
    <div className="ecran">
      <div className="ecran__kpis">
        <Panneau><Kpi libelle="Puissance solaire installée" valeur={String(80 + (s.sim.parking ? 30 : 0))} unite="kWc" ton="soleil" note={s.sim.parking ? 'gymnase + ombrières du parking' : 'toit du gymnase'} /></Panneau>
        <Panneau><Kpi libelle="Soleil consommé sur place" valeur={pct(on.taux)} ton="bon" note={`${pct(off.taux)} sans coordination`} /></Panneau>
        <Panneau><Kpi libelle="Pic sur le poste" valeur={kw(on.peak).replace(' kW', '')} unite="kW" ton="reseau" note={`capacité 60 kW · ${kw(off.peak)} sans coordination`} /></Panneau>
        <Panneau><Kpi libelle="Économies du quartier" valeur={euro(off.cost - on.cost)} ton="bon" note="sur cette journée" /></Panneau>
      </div>

      <div className="ecran__colonnes">
        <Panneau titre="Simulateur" icone="equipements">
          <p className="texte-2" style={{ marginBottom: 12 }}>Cochez pour voir l'effet sur l'opération : le moteur recalcule tout le quartier.</p>
          <div className="simulateur">
            {SIMULATEUR.map(o => (
              <label key={o.cle} className="simulateur__choix">
                <span className="besoin__icone"><Icone nom={o.icone} taille={18} /></span>
                <span><b>{o.nom}</b><small>{o.detail}</small></span>
                <span className="interrupteur"><input type="checkbox" checked={s.sim[o.cle]} onChange={e => s.setSim({ ...s.sim, [o.cle]: e.target.checked })} /></span>
              </label>
            ))}
          </div>
        </Panneau>

        <div className="ecran__pile">
          <Panneau titre="Bâtiments municipaux" icone="mairie" action={<span className="texte-2" style={{ fontSize: 12 }}>planifiés par le même moteur</span>}>
            <ul className="besoins">
              {MUNI.map((t, k) => (
                <li key={t.name} className="besoin">
                  <span className="besoin__icone"><Icone nom={ICONES_MUNI[k]} taille={18} /></span>
                  <span className="besoin__texte"><b>{t.name}</b><small>{t.p.toString().replace('.', ',')} kW · {t.dur / 2} h de fonctionnement</small></span>
                  <span className="chiffre besoin__creneau">{rangeText(s.muni[k])}</span>
                </li>
              ))}
            </ul>
          </Panneau>

          <Panneau titre="Bornes publiques" icone="voiture" action={<span className="chiffre texte-2" style={{ fontSize: 12 }}>à {label(i)}</span>}>
            <div className="bornes">
              {bornes.map(([nom, v, libres]) => (
                <div key={nom} className="borne">
                  <b>{nom}</b>
                  <small className="texte-2">{libres} place{libres > 1 ? 's' : ''} libre{libres > 1 ? 's' : ''}</small>
                  <span className="chiffre soleil">{pct(v)} soleil local</span>
                  <span className="jauge"><i style={{ width: `${Math.round(v * 100)}%` }} /></span>
                </div>
              ))}
            </div>
          </Panneau>
        </div>
      </div>
    </div>
  )
}
