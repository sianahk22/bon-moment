import type { ReactNode } from 'react'
import Icone, { type NomIcone } from './Icone'

// Panneau : la brique de base de toutes les pages. `flottant` = posé au-dessus de la 3D (transparence + flou).
export function Panneau({ titre, icone, action, flottant, className = '', children }: {
  titre?: string
  icone?: NomIcone
  action?: ReactNode
  flottant?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <section className={`panneau ${flottant ? 'panneau--flottant' : ''} ${className}`}>
      {(titre || action) && (
        <header className="panneau__tete">
          {titre && <h2 className="panneau__titre">{icone && <Icone nom={icone} taille={16} />}{titre}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

// Chiffre clé : grand nombre en police mono, petit libellé, explication courte.
export function Kpi({ libelle, valeur, unite, note, ton, icone }: {
  libelle: string
  valeur: string
  unite?: string
  note?: string
  ton?: 'soleil' | 'reseau' | 'bon' | 'eviter'
  icone?: NomIcone
}) {
  return (
    <div className={`kpi ${ton ? `kpi--${ton}` : ''} ${icone ? 'kpi--icone' : ''}`}>
      {icone && <span className="kpi__icone" aria-hidden="true"><Icone nom={icone} taille={18} /></span>}
      <span className="surtitre">{libelle}</span>
      <span className="kpi__valeur chiffre">{valeur}{unite && <small>{unite}</small>}</span>
      {note && <span className="kpi__note">{note}</span>}
    </div>
  )
}

// Pastille de couleur cohérente partout : bon moment / à éviter / soleil / réseau.
export function Pastille({ ton, children }: { ton: 'bon' | 'eviter' | 'soleil' | 'reseau' | 'neutre'; children: ReactNode }) {
  return <span className={`pastille pastille--${ton}`}><i aria-hidden="true" />{children}</span>
}

// Bandeau obligatoire sur tout écran qui utilise des données simulées.
export function BandeauDemo() {
  return (
    <p className="bandeau-demo" role="note">
      <i aria-hidden="true" />Données de démonstration
    </p>
  )
}
