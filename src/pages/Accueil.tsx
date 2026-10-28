import { Link } from 'react-router-dom'
import { PROFILS, type Profil } from '../data/profils'
import { kw, label, ranges } from '../engine'
import ArcSoleil from '../ui/ArcSoleil'
import { BandeauDemo, Kpi, Pastille } from '../ui/composants'
import Icone from '../ui/Icone'
import { useMomentsDuJour } from '../ui/momentsDuJour'

interface Props {
  prenom: string
  setPrenom: (valeur: string) => void
}

const MAINTENANT = 10 // 13h : l'heure affichée par défaut dans la démo

export default function Accueil({ prenom, setPrenom }: Props) {
  const m = useMomentsDuJour(undefined)
  const meilleur = ranges(m.qualites.flatMap((q, i) => (q === 'bon' ? [i] : [])))
    .sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]))[0]
  const ville = PROFILS.find(p => p.id === 'ville')!
  const autres = PROFILS.filter(p => p.id !== 'ville')

  return (
    <>
      <section className="hero">
        <div className="hero__texte">
          <BandeauDemo />
          <p className="surtitre">Quartier Croix-de-Chavaux · Montreuil</p>
          <h1>Le <span className="soleil">soleil</span> du quartier,<br />au bon moment.</h1>
          <p className="hero__intro">
            Dites <strong>pour quand</strong> vous avez besoin de quelque chose : la voiture chargée à 7 h,
            le linge propre avant 18 h. Le Bon Moment choisit l'heure où les panneaux partagés produisent,
            où l'électricité est la moins polluante et la moins chère, et coordonne tous les voisins.
          </p>
          <label className="champ hero__prenom">
            <span className="surtitre">Votre prénom (facultatif)</span>
            <input type="text" value={prenom} maxLength={30} placeholder="Ex. Camille" onChange={(e) => setPrenom(e.target.value)} />
          </label>
        </div>

        <div className="panneau hero__arc">
          <div className="panneau__tete">
            <span className="surtitre">Aujourd'hui dans le quartier</span>
            <span className="puce"><Icone nom="soleil" taille={14} />{m.scenario.nom} · {m.scenario.tempo}</span>
          </div>
          <ArcSoleil
            soleil={m.soleil}
            qualites={m.qualites}
            maintenant={MAINTENANT}
            titre={label(MAINTENANT)}
            legende="heure simulée"
            description={`Journée de 8 h à 8 h. Meilleurs moments : ${m.bonsTexte}.`}
          />
          <div className="legende">
            <Pastille ton="bon">Bon moment</Pastille>
            <Pastille ton="eviter">À éviter</Pastille>
            <Pastille ton="soleil">Soleil du quartier</Pastille>
          </div>
          <div className="hero__kpis">
            <Kpi libelle="Meilleur moment" valeur={meilleur ? `${label(meilleur[0])}–${label(meilleur[1] + 1)}` : '–'} ton="bon" />
            <Kpi libelle="Pic solaire" valeur={kw(m.picProduction).replace(' kW', '')} unite="kW" ton="soleil" />
            <Kpi libelle="Tempo heures pleines" valeur={m.scenario.hp.toFixed(4).replace('.', ',')} unite="€/kWh" note="tarif réel" />
          </div>
        </div>
      </section>

      <section className="espaces" aria-labelledby="titre-espaces">
        <div className="espaces__tete">
          <div>
            <p className="surtitre">4 profils de démonstration</p>
            <h2 id="titre-espaces">Choisissez un espace</h2>
          </div>
          <p className="texte-2">Un clic : le profil est déjà rempli.</p>
        </div>

        <div className="espaces__grille">
          <Link to={`/espace/${ville.id}`} className="espace-carte espace-carte--vitrine">
            <div className="vitrine__haut">
              <span className="espace-carte__icone"><Icone nom={ville.icone} taille={22} /></span>
              <span className="puce"><Icone nom="ville3d" taille={14} />Jumeau numérique 3D</span>
            </div>
            <MiniQuartier />
            <div className="vitrine__bas">
              <div className="espace-carte__texte">
                <span className="surtitre">{ville.espace} · {ville.offre}</span>
                <span className="espace-carte__nom">{ville.persona} <span>· {ville.description}</span></span>
                <span className="espace-carte__accroche">{ville.accroche}</span>
              </div>
              <Icone nom="fleche" className="espace-carte__fleche" taille={22} />
            </div>
          </Link>

          {autres.map(p => <CarteEspace key={p.id} profil={p} />)}
        </div>
      </section>
    </>
  )
}

function CarteEspace({ profil: p }: { profil: Profil }) {
  return (
    <Link to={`/espace/${p.id}`} className="espace-carte">
      <span className="espace-carte__icone"><Icone nom={p.icone} taille={22} /></span>
      <span className="espace-carte__texte">
        <span className="surtitre">{p.espace} · {p.offre}</span>
        <span className="espace-carte__nom">{p.persona} <span>· {p.description}</span></span>
        <span className="espace-carte__accroche">{p.accroche}</span>
      </span>
      <Icone nom="fleche" className="espace-carte__fleche" />
    </Link>
  )
}

// Petite illustration au trait du quartier : le gymnase solaire alimente les voisins, le poste complète.
function MiniQuartier() {
  return (
    <svg className="vitrine__illu" viewBox="0 0 400 150" aria-hidden="true" fill="none">
      <line x1="0" y1="132" x2="400" y2="132" stroke="var(--trait-fort)" />
      {/* Flux solaires (ambre) depuis le toit du gymnase */}
      <path d="M86 90 C 120 40, 170 40, 196 70" stroke="var(--soleil)" strokeWidth="1.4" strokeDasharray="2 5" strokeLinecap="round" />
      <path d="M96 90 C 150 10, 230 10, 262 36" stroke="var(--soleil)" strokeWidth="1.4" strokeDasharray="2 5" strokeLinecap="round" />
      {/* Flux réseau (cyan) depuis le poste */}
      <path d="M372 40 C 352 60, 330 70, 312 70" stroke="var(--reseau)" strokeWidth="1.4" strokeDasharray="2 5" strokeLinecap="round" />
      {/* Gymnase et panneaux */}
      <rect x="30" y="96" width="110" height="36" rx="2" fill="var(--nuit-2)" stroke="var(--trait-fort)" />
      {[0, 1, 2, 3, 4, 5].map(i => <rect key={i} x={38 + i * 17} y="88" width="13" height="5" rx="1" fill="var(--soleil)" opacity=".9" />)}
      <rect x="30" y="80" width="110" height="20" fill="url(#halo)" opacity=".5" />
      {/* École */}
      <rect x="168" y="74" width="58" height="58" rx="2" fill="var(--nuit-2)" stroke="var(--trait-fort)" />
      {/* Logements */}
      <rect x="240" y="40" width="40" height="92" rx="2" fill="var(--nuit-2)" stroke="var(--trait-fort)" />
      <rect x="290" y="70" width="40" height="62" rx="2" fill="var(--nuit-2)" stroke="var(--trait-fort)" />
      {[0, 1, 2, 3, 4, 5].map(r => [0, 1].map(c => (
        <rect key={`${r}-${c}`} x={248 + c * 14} y={50 + r * 13} width="8" height="5" rx="1" fill="var(--reseau)" opacity={(r + c) % 3 === 0 ? .7 : .18} />
      )))}
      {[0, 1].map(c => <rect key={c} x={176 + c * 24} y="88" width="18" height="6" rx="1" fill="var(--reseau)" opacity=".25" />)}
      {/* Poste électrique */}
      <path d="M366 132 L372 30 L378 132 M360 50 H384 M362 70 H382" stroke="var(--trait-fort)" strokeWidth="1.4" />
      <defs>
        <linearGradient id="halo" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="var(--soleil)" stopOpacity=".35" />
          <stop offset="1" stopColor="var(--soleil)" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
