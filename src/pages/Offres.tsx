const OFFRES = [
  { nom: 'Gratuit', prix: '0 €', detail: 'Les meilleurs moments du jour et 2 appareils connectés.' },
  { nom: 'Premium', prix: '3,99 €', detail: 'Pilotage automatique illimité : voiture, borne, chauffe-eau.' },
  { nom: 'Entreprise', prix: 'Sur devis', detail: 'Équipements professionnels et contraintes métier.' },
  { nom: 'Ville', prix: 'Licence annuelle', detail: 'Coordination du quartier et bâtiments municipaux.' },
]

export default function Offres() {
  return (
    <section>
      <h1>Offres</h1>
      <p>Démonstration : aucun paiement n'est possible. Périodicité du Premium à confirmer.</p>
      <ul className="profils">
        {OFFRES.map((o) => (
          <li key={o.nom} className="profil">
            <span className="profil-espace">{o.nom}</span>
            <strong>{o.prix}</strong>
            <span>{o.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
