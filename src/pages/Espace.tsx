import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { USERS } from '../data/appareils'
import { trouverProfil } from '../data/profils'
import { kw, label, ranges } from '../engine'
import ArcSoleil from '../ui/ArcSoleil'
import { BandeauDemo, Kpi, Panneau, Pastille } from '../ui/composants'
import Icone from '../ui/Icone'
import { useMomentsDuJour } from '../ui/momentsDuJour'

interface Props {
  prenom: string
}

const MAINTENANT = 10 // 13h

const plage = (r?: [number, number]) => (r ? `${label(r[0])}–${label(r[1] + 1)}` : '–')
const plusLongue = (rs: [number, number][]) => rs.slice().sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]))[0]

// Page commune aux 4 espaces : même structure, seule la densité change.
export default function Espace({ prenom }: Props) {
  const { id } = useParams()
  const profil = trouverProfil(id)
  const [onglet, setOnglet] = useState(0)
  const m = useMomentsDuJour(profil?.userId)

  if (!profil) {
    return <p>Espace inconnu. <Link to="/">Retour à l'accueil</Link></p>
  }

  const nomAffiche = prenom.trim() || profil.persona
  const indices = (q: string) => m.qualites.flatMap((x, i) => (x === q ? [i] : []))
  const bon = plusLongue(ranges(indices('bon')))
  const eviter = plusLongue(ranges(indices('eviter')))
  const solaire = profil.userId ? USERS[profil.userId].share * Math.max(...m.quartier.ctx.map(c => c.sun)) : m.picProduction

  return (
    <>
      <Link to="/" className="espace__retour"><Icone nom="retour" taille={16} />Changer d'espace</Link>

      <div className="espace__tete">
        <div className="espace__identite">
          <span className="espace-carte__icone"><Icone nom={profil.icone} taille={26} /></span>
          <div>
            <p className="surtitre">{profil.espace} · {profil.offre}</p>
            <h1>Bonjour {nomAffiche}</h1>
            <p>{profil.description}</p>
          </div>
        </div>
        <div className="espace__contexte">
          <span className="puce"><Icone nom="soleil" taille={14} />{m.scenario.nom} · {m.scenario.tempo}</span>
          <BandeauDemo />
        </div>
      </div>

      <nav className="onglets" role="tablist" aria-label={`Onglets de l'espace ${profil.espace}`}>
        {profil.onglets.map((o, i) => (
          <button key={o.nom} role="tab" aria-selected={i === onglet} onClick={() => setOnglet(i)}>
            <Icone nom={o.icone} taille={18} />
            {o.nom}
          </button>
        ))}
      </nav>

      {onglet === 0 ? (
        <div className="espace__contenu" role="tabpanel">
          <Panneau titre="Les bons moments d'aujourd'hui" icone="moments">
            <ArcSoleil
              soleil={m.soleil}
              qualites={m.qualites}
              maintenant={MAINTENANT}
              titre={label(MAINTENANT)}
              legende="heure simulée"
              description={`Journée de 8 h à 8 h pour ${profil.persona}. Meilleurs moments : ${m.bonsTexte}.`}
            />
            <div className="legende" style={{ justifyContent: 'center', marginTop: 12 }}>
              <Pastille ton="bon">Bon moment</Pastille>
              <Pastille ton="eviter">À éviter</Pastille>
              <Pastille ton="soleil">Soleil du quartier</Pastille>
            </div>
          </Panneau>
          <div className="espace__kpis">
            <Panneau>
              <Kpi libelle="Meilleur moment" valeur={plage(bon)} ton="bon" note="soleil du quartier et électricité peu carbonée" />
              <Kpi libelle="Moment à éviter" valeur={plage(eviter)} ton="eviter" note="réseau chargé, électricité plus chère et plus polluante" />
              <Kpi libelle={profil.userId ? 'Votre part de soleil' : 'Pic solaire du quartier'} valeur={kw(solaire).replace(' kW', '')} unite="kW" ton="soleil" note="au plus fort de la journée" />
            </Panneau>
          </div>
        </div>
      ) : (
        <Panneau className="espace__onglet-vide">
          <div className="a-venir" role="tabpanel">
            <Icone nom={profil.onglets[onglet].icone} taille={34} />
            <h2>{profil.onglets[onglet].nom}</h2>
            <p>Cet onglet est en cours de construction.</p>
          </div>
        </Panneau>
      )}
    </>
  )
}
