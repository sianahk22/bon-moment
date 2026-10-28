// Jeu d'icônes au trait, toutes dessinées sur la même grille 24×24, trait 1,6.
const CHEMINS = {
  soleil: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>',
  reseau: '<path d="M9 21.5l3-19 3 19M6 6.5h12M7.6 11.5h8.8M8.4 16.5h7.2"/>',
  eclair: '<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z"/>',
  maison: '<path d="M3.5 11L12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>',
  boutique: '<path d="M4.5 10v10h15V10"/><path d="M3 10l2-5.5h14L21 10z"/><path d="M3 10c0 1.4 1.3 2.5 3 2.5S9 11.4 9 10c0 1.4 1.3 2.5 3 2.5s3-1.1 3-2.5c0 1.4 1.3 2.5 3 2.5s3-1.1 3-2.5"/><path d="M10 20v-4.5h4V20"/>',
  mairie: '<path d="M12 3l8.5 5h-17z"/><path d="M3 21h18M4.5 10.5h15M6.5 10.5V21M10 10.5V21M14 10.5V21M17.5 10.5V21"/>',
  moments: '<circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l2.5 1.8M9.5 2.5h5"/>',
  planning: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M7.5 14h3M13.5 14h3M7.5 17h3"/>',
  appareils: '<path d="M9 2.5v4.5M15 2.5v4.5"/><path d="M6.5 7h11v3.5a5.5 5.5 0 0 1-11 0z"/><path d="M12 16v5.5"/>',
  bilan: '<path d="M3.5 20.5h17"/><path d="M6.5 17v-5M11 17V7M15.5 17v-7.5M20 17V4.5"/>',
  ville3d: '<path d="M12 2.5l8.5 4.8v9.4L12 21.5l-8.5-4.8V7.3z"/><path d="M3.5 7.3L12 12l8.5-4.7M12 12v9.5"/>',
  equipements: '<path d="M14.6 6.4a4 4 0 0 0-5.3 5.3L3.5 17.5l3 3 5.8-5.8a4 4 0 0 0 5.3-5.3l-2.4 2.4-2.6-.4-.4-2.6z"/>',
  nuage: '<path d="M7 18.5h10.5a4 4 0 0 0 .4-8 6 6 0 0 0-11.6 1.6A3.5 3.5 0 0 0 7 18.5z"/>',
  feuille: '<path d="M5 19.5C5 11 10.5 5 20 4.5 19.5 14 13.5 19.5 5 19.5z"/><path d="M5 19.5l7.5-7.5"/>',
  euro: '<path d="M17.5 6.5a7 7 0 1 0 0 11"/><path d="M4 10.5h9M4 13.5h9"/>',
  fleche: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  retour: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  frigo: '<rect x="6" y="2.5" width="12" height="19" rx="2"/><path d="M6 9.5h12M9 5.5v2M9 12.5v3"/>',
  four: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><rect x="6.5" y="9" width="11" height="8" rx="1"/><path d="M7 6.5h1M10 6.5h1"/>',
  plaques: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10.5" r="2.5"/><circle cx="15.5" cy="13.5" r="2.5"/>',
  ecran: '<rect x="3" y="4.5" width="18" height="12" rx="1.5"/><path d="M9 20.5h6M12 16.5v4"/>',
  ordinateur: '<rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M3 19h18"/>',
  lampe: '<path d="M9 18.5h6M10 21.5h4"/><path d="M12 2.5a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.6c0-.8.4-1.5 1-2A6 6 0 0 0 12 2.5z"/>',
  radiateur: '<rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M7.5 6v12M11.5 6v12M15.5 6v12M5 21v-3M19 21v-3"/>',
  coche: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  deplacer: '<path d="M7 7h11l-3-3M17 17H6l3 3"/>',
  cloche: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  croix: '<path d="M6 6l12 12M18 6L6 18"/>',
  voiture: '<path d="M4 16v-3l2-5h12l2 5v3z"/><circle cx="8" cy="16.5" r="1.6"/><circle cx="16" cy="16.5" r="1.6"/><path d="M12 3l-1.5 3h3L12 9"/>',
  linge: '<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M8 6h2"/>',
  eau: '<path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>',
  vaisselle: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16M8 13v4M12 13v4M16 13v4"/>',
  secheLinge: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 11c1-1 2 1 3 0s2 1 3 0M9 15c1-1 2 1 3 0s2 1 3 0"/>',
  froid: '<path d="M12 3v18M5 7l14 10M19 7L5 17"/>',
  utilitaire: '<path d="M3 16V8h11v8M14 11h4l3 3v2h-7"/><circle cx="7" cy="17" r="1.6"/><circle cx="17" cy="17" r="1.6"/>',
} as const

export type NomIcone = keyof typeof CHEMINS

interface Props {
  nom: NomIcone
  taille?: number
  className?: string
}

export default function Icone({ nom, taille = 20, className }: Props) {
  return (
    <svg
      className={className}
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      // Chemins fixes écrits ci-dessus (aucune donnée utilisateur) : l'injection HTML est sans risque ici.
      dangerouslySetInnerHTML={{ __html: CHEMINS[nom] }}
    />
  )
}
