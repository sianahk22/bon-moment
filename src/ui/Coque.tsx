import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Profil } from '../data/profils'
import { SCENARIOS, type ScenarioId } from '../engine'
import { BandeauDemo } from './composants'
import Icone from './Icone'
import Logo from './Logo'
import MenuProfil from './MenuProfil'
import { useSimulation } from './simulation'

// Mise en page commune aux 4 espaces : barre du haut, barre latérale d'onglets, zone centrale.
export default function Coque({ profil, onglet, setOnglet, prenom, setPrenom, children }: {
  profil: Profil
  onglet: number
  setOnglet: (i: number) => void
  prenom: string
  setPrenom: (v: string) => void
  children: ReactNode
}) {
  const s = useSimulation()

  return (
    <div className="coque">
      <header className="barre-haut">
        <Link to="/" className="marque" aria-label="Le Bon Moment, choisir un profil">
          <Logo />
          <span>Le Bon Moment</span>
        </Link>

        <div className="segments" role="group" aria-label="Type de journée">
          {(Object.keys(SCENARIOS) as ScenarioId[]).map(k => (
            <button key={k} type="button" aria-pressed={s.scenario === k} onClick={() => s.setScenario(k)}>
              {SCENARIOS[k].nom}<small>{SCENARIOS[k].tempo}</small>
            </button>
          ))}
        </div>

        <div className="barre-haut__droite">
          <BandeauDemo />
          <MenuProfil profil={profil} prenom={prenom} setPrenom={setPrenom} />
        </div>
      </header>

      <nav className="barre-laterale" role="tablist" aria-label={`Onglets de l'espace ${profil.espace}`}>
        {profil.onglets.map((o, i) => (
          <button key={o.nom} role="tab" aria-selected={i === onglet} onClick={() => setOnglet(i)}>
            <Icone nom={o.icone} taille={20} />
            <span>{o.nom}</span>
          </button>
        ))}
      </nav>

      <main className="zone" role="tabpanel">{children}</main>
    </div>
  )
}
