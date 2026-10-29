import { formatJour, nomJour } from '../data/demo'
import { euro, isHC, rangeText } from '../engine'
import { Kpi, Panneau } from '../ui/composants'
import Icone from '../ui/Icone'
import { Gain, ModePuce, StatutPuce, TempoPuce, kg, nombre } from './commun'
import ApercuRappel from './ApercuRappel'
import type { EtatFoyer, JourPlanifie } from './useFoyer'

export default function EcranMoments({ foyer }: { foyer: EtatFoyer }) {
  const { jours, notifications } = foyer.historique
  const moments = jours.flatMap(j => j.moments)
  const suivis = moments.filter(m => m.statut !== 'ignore').length
  const recents = jours.slice(-4).reverse().flatMap(j => j.moments.slice().sort((a, b) => b.debut - a.debut)).slice(0, 9)
  const [auj, demain] = foyer.semaine

  return (
    <div className="ecran">
      <Panneau className="historique-resume">
        <div>
          <p className="surtitre">Depuis 60 jours avec Le Bon Moment</p>
          <p className="texte-2">Données de démonstration, calculées par le moteur jour après jour.</p>
        </div>
        <Kpi icone="euro" libelle="Économisés" valeur={euro(jours.reduce((s, j) => s + j.economie, 0))} ton="bon" />
        <Kpi icone="feuille" libelle="CO₂ évité" valeur={kg(jours.reduce((s, j) => s + j.co2Evite, 0))} />
        <Kpi icone="soleil" libelle="Soleil du quartier" valeur={nombre(jours.reduce((s, j) => s + j.solaireKwh, 0))} unite="kWh" ton="soleil" />
        <Kpi icone="moments" libelle="Moments suivis" valeur={`${Math.round(100 * suivis / moments.length)} %`} note={`${suivis} sur ${moments.length}`} />
      </Panneau>

      <div className="ecran__colonnes">
        <div className="ecran__pile">
          <Panneau titre="Aujourd'hui" icone="moments" action={<TempoPuce tempo={auj.cal.tempo} nuage={auj.cal.nuage} />}>
            <ListeMoments jour={auj} />
          </Panneau>
          <Panneau titre={`Demain · ${formatJour(demain.cal.date)}`} icone="moments" action={<TempoPuce tempo={demain.cal.tempo} nuage={demain.cal.nuage} />}>
            <ListeMoments jour={demain} />
          </Panneau>
        </div>

        <div className="ecran__pile">
          {foyer.aujourdhui.taches.some(t => !t.auto) && (
            <Panneau titre="Votre rappel sur téléphone" icone="cloche">
              <ApercuRappel foyer={foyer} />
            </Panneau>
          )}
          <Panneau titre="Derniers moments" icone="bilan">
            <ul className="historique">
              {recents.map((m, i) => (
                <li key={i}>
                  <span className="historique__quand">{nomJour(m.decalage, jours[jours.length + m.decalage].cal.date)}<br /><span className="chiffre">{m.creneau.split('–')[0]}</span></span>
                  <span className="historique__quoi"><Icone nom={m.icone} taille={16} />{m.nom}</span>
                  <StatutPuce statut={m.statut} />
                  <Gain valeur={m.economie} />
                </li>
              ))}
            </ul>
          </Panneau>
          <Panneau titre="Notifications" icone="cloche">
            <ul className="notifications">
              {notifications.map((n, i) => (
                <li key={i} className={`notif notif--${n.ton}`}>
                  <span className="chiffre">{n.decalage === 0 ? 'Auj.' : n.decalage === -1 ? 'Hier' : `J${n.decalage}`} · {n.heure}</span>
                  <p>{n.texte}</p>
                </li>
              ))}
            </ul>
          </Panneau>
        </div>
      </div>
    </div>
  )
}

function ListeMoments({ jour }: { jour: JourPlanifie }) {
  const lignes = jour.taches.map((t, k) => ({ t, k, debut: Math.min(...jour.reel[k]) })).sort((a, b) => a.debut - b.debut)
  return (
    <ul className="moments">
      {lignes.map(({ t, k, debut }) => {
        const c = jour.ctx[debut]
        const pourquoi = jour.f.solar[debut] > .3 ? 'soleil du quartier' : isHC(c.h) ? 'heures creuses' : 'électricité peu carbonée'
        const gain = jour.f.naive.per[k].cost - jour.bilan.per[k].cost
        return (
          <li key={`${t.id}-${k}`} className="moment">
            <span className="moment__heure chiffre">{rangeText(jour.reel[k])}</span>
            <span className="moment__texte"><b>{t.name}</b><small>{pourquoi}</small></span>
            <ModePuce auto={t.auto} />
            <Gain valeur={gain} />
          </li>
        )
      })}
    </ul>
  )
}
