// Logo : l'arc du soleil (la journée) avec le soleil posé au bon moment.
export default function Logo({ taille = 30 }: { taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x=".5" y=".5" width="31" height="31" rx="9" fill="#0b1829" stroke="rgba(140,210,240,.28)" />
      <path d="M6 22a10 10 0 0 1 20 0" stroke="var(--reseau)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 22h22" stroke="rgba(140,210,240,.35)" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="21.4" cy="13.6" r="3" fill="var(--soleil)" />
      <circle cx="21.4" cy="13.6" r="5.2" fill="var(--soleil)" opacity=".18" />
    </svg>
  )
}
