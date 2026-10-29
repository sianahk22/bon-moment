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
  // Fond léger « ville » sur les tableaux de bord ; la vue 3D garde son propre ciel.
  const fond = profil.onglets[onglet].nom !== 'Ville 3D'

  return (
    <div className={`coque ${profil.userId ? 'coque--foyer' : ''} ${fond ? 'coque--fond' : ''}`}>
      {fond && <DecorVille />}
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

// Silhouette de ville très discrète en bas d'écran (espaces Particulier et Entreprise).
function DecorVille() {
  const tours = [[40, 120, 60], [110, 190, 44], [160, 150, 70], [240, 230, 50], [300, 170, 80], [390, 260, 46], [440, 200, 64],
    [520, 150, 90], [620, 240, 52], [680, 180, 70], [760, 280, 48], [820, 210, 76], [910, 160, 60], [980, 250, 54], [1040, 190, 80],
    [1130, 230, 46], [1180, 170, 70], [1260, 270, 52], [1320, 200, 74], [1400, 150, 64], [1470, 240, 50], [1530, 180, 70]]
  return (
    <div className="coque__decor" aria-hidden="true">
      <svg viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="decor-tour" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a9cddc" stopOpacity=".3" />
            <stop offset="1" stopColor="#9cc3d6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {tours.map(([x, h, l]) => (
          <g key={x}>
            <rect x={x} y={300 - h} width={l} height={h} rx="3" fill="url(#decor-tour)" />
            {h > 220 && <line x1={x + l / 2} x2={x + l / 2} y1={300 - h} y2={300 - h - 30} stroke="#a9cddc" strokeOpacity=".35" strokeWidth="2" />}
          </g>
        ))}
      </svg>
    </div>
  )
}
