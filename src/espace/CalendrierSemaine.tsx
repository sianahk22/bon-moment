import { useState } from 'react'
import { nomJour } from '../data/demo'
import { euro, evaluate, label, rangeText } from '../engine'
import Icone from '../ui/Icone'
import { TempoPuce } from './commun'
import { cle, type EtatFoyer, type JourPlanifie } from './useFoyer'

// La semaine : une colonne par jour, chaque appareil avec son heure de départ.
// On touche un appareil pour valider son créneau ou en choisir un autre.
export default function CalendrierSemaine({ foyer }: { foyer: EtatFoyer }) {
  const [choisi, setChoisi] = useState<{ d: number; k: number } | null>({ d: 1, k: 0 })
  const jourChoisi = choisi ? foyer.semaine[choisi.d] : null

  return (
    <div className="sem">
      <div className="sem__jours">
        {foyer.semaine.map((j, d) => {
          const lignes = j.taches.map((t, k) => ({ t, k, debut: Math.min(...j.reel[k]) })).sort((a, b) => a.debut - b.debut)
          return (
            <div key={d} className={`sem__jour ${d === 0 ? 'sem__jour--auj' : ''}`}>
              <div className="sem__tete">
                <b>{nomJour(j.cal.decalage, j.cal.date)}</b>
                <TempoPuce tempo={j.cal.tempo} nuage={j.cal.nuage} />
              </div>
              <ul>
                {lignes.map(({ t, k, debut }) => {
                  const valide = foyer.valides[cle(j.cal.decalage, t, k)]
                  const actif = choisi?.d === d && choisi.k === k
                  const icone = foyer.appareils.find(a => a.type === t.type)?.icone ?? 'appareils'
                  return (
                    <li key={`${t.id}-${k}`}>
                      <button
                        type="button"
                        className={`sem__item ${t.auto ? 'sem__item--auto' : 'sem__item--rappel'} ${actif ? 'sem__item--actif' : ''}`}
                        title={`${t.name} · ${rangeText(j.reel[k])}`}
                        aria-label={`${t.name}, ${rangeText(j.reel[k])}${valide ? ', validé' : ''}`}
                        onClick={() => setChoisi({ d, k })}
                      >
                        <Icone nom={icone} taille={15} />
                        <span className="chiffre">{label(debut)}</span>
                        {valide && <Icone nom="coche" taille={13} className="sem__valide" />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>

      {choisi && jourChoisi && jourChoisi.taches[choisi.k] && <Detail foyer={foyer} jour={jourChoisi} k={choisi.k} />}
    </div>
  )
}

function Detail({ foyer, jour, k }: { foyer: EtatFoyer; jour: JourPlanifie; k: number }) {
  const t = jour.taches[k]
  const c = cle(jour.cal.decalage, t, k)
  const valide = foyer.valides[c]
  const cout = (slots: number[]) => evaluate([t], [slots], jour.ctx, jour.f.solar).cost
  const actuel = cout(jour.reel[k]), meilleur = cout(jour.options[k][0])
  const n = jour.options[k].length
  const indice = jour.options[k].findIndex(o => o.join() === jour.reel[k].join())

  return (
    <div className="semaine__detail">
      <div>
        <p className="surtitre">{nomJour(jour.cal.decalage, jour.cal.date)} · {t.auto ? 'automatique' : 'rappel'}</p>
        <p className="semaine__detail-titre"><b>{t.name}</b> · <span className="chiffre">{rangeText(jour.reel[k])}</span></p>
        <p className="texte-2">
          Coût estimé <span className="chiffre">{euro(actuel)}</span>
          {indice > 0 && <> · <span className="eviter">+{euro(actuel - meilleur)}</span> par rapport au créneau conseillé</>}
          {indice === 0 && <> · créneau conseillé par le moteur</>}
        </p>
      </div>
      <div className="semaine__actions">
        <button type="button" className="btn btn--contour" disabled={n < 2} onClick={() => foyer.deplacer(jour, k)}>
          <Icone nom="deplacer" taille={16} />Autre créneau ({indice + 1}/{n})
        </button>
        <button type="button" className={`btn ${valide ? 'btn--contour' : 'btn--plein'}`} aria-pressed={!!valide} onClick={() => foyer.valider(jour, k)}>
          <Icone nom="coche" taille={16} />{valide ? 'Validé' : 'Valider'}
        </button>
      </div>
    </div>
  )
}
