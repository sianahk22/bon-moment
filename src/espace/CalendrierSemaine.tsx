import { useState } from 'react'
import { formatJour, nomJour } from '../data/demo'
import { SLOTS, euro, evaluate, label, rangeText, ranges } from '../engine'
import Icone from '../ui/Icone'
import { TempoPuce } from './commun'
import { cle, type EtatFoyer, type JourPlanifie } from './useFoyer'

// Calendrier de la semaine : chaque colonne est une journée de 8h à 8h, chaque bloc un appareil programmé.
export default function CalendrierSemaine({ foyer }: { foyer: EtatFoyer }) {
  const [choisi, setChoisi] = useState<{ d: number; k: number } | null>({ d: 1, k: 0 })
  const jourChoisi = choisi ? foyer.semaine[choisi.d] : null

  return (
    <div className="semaine">
      <div className="semaine__grille">
        <div className="semaine__heures" aria-hidden="true">
          {[0, 12, 24, 36].map(i => <span key={i} style={{ top: `${(i / SLOTS) * 100}%` }}>{label(i)}</span>)}
        </div>
        {foyer.semaine.map((j, d) => (
          <div key={d} className="semaine__jour">
            <div className="semaine__tete">
              <b>{nomJour(j.cal.decalage, j.cal.date)}</b>
              <TempoPuce tempo={j.cal.tempo} nuage={j.cal.nuage} />
            </div>
            <div className="semaine__corps">
              {[12, 24, 36].map(i => <i key={i} className="semaine__ligne" style={{ top: `${(i / SLOTS) * 100}%` }} />)}
              {j.taches.map((t, k) => ranges(j.reel[k]).map(([a, b]) => {
                const valide = foyer.valides[cle(j.cal.decalage, t, k)]
                const actif = choisi?.d === d && choisi.k === k
                return (
                  <button
                    key={`${t.id}-${k}-${a}`}
                    type="button"
                    className={`bloc ${t.auto ? 'bloc--auto' : 'bloc--rappel'} ${valide ? 'bloc--valide' : ''} ${actif ? 'bloc--actif' : ''}`}
                    style={{ top: `${(a / SLOTS) * 100}%`, height: `${((b - a + 1) / SLOTS) * 100}%`, left: `${(k / j.taches.length) * 100}%`, width: `${100 / j.taches.length}%` }}
                    title={`${t.name} · ${rangeText(j.reel[k])}`}
                    aria-label={`${t.name}, ${formatJour(j.cal.date)}, ${rangeText(j.reel[k])}${valide ? ', validé' : ''}`}
                    onClick={() => setChoisi({ d, k })}
                  >
                    {valide && <Icone nom="coche" taille={12} />}
                  </button>
                )
              }))}
            </div>
          </div>
        ))}
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
