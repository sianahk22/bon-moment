import { Panneau } from '../ui/composants'
import Icone, { type NomIcone } from '../ui/Icone'

const OFFRES: { nom: string; pour: string; prix: string; unite?: string; icone: NomIcone; points: string[]; phare?: boolean }[] = [
  { nom: 'Gratuit', pour: 'Habitant', prix: '0 €', icone: 'maison',
    points: ['Les meilleurs moments du jour', 'Planning par échéance', 'Rappels au bon moment', '2 appareils connectés'] },
  { nom: 'Premium', pour: 'Habitant équipé', prix: '3,99 €', unite: 'périodicité à confirmer', icone: 'voiture', phare: true,
    points: ['Pilotage automatique illimité', 'Voiture électrique et borne', 'Curseur économies / écologie', 'Bilan mensuel'] },
  { nom: 'Entreprise', pour: 'Commerces, artisans', prix: 'Sur devis', icone: 'boutique',
    points: ['Équipements professionnels', 'Contraintes métier (horaires, livraisons)', 'Pic par rapport à l\'abonnement', 'Bilan de facture'] },
  { nom: 'Ville', pour: 'Collectivités', prix: 'Licence', unite: 'annuelle', icone: 'mairie',
    points: ['Coordination de tout le quartier', 'Jumeau numérique 3D', 'Bâtiments municipaux et bornes', 'Simulateur de projets'] },
]

export default function Offres() {
  return (
    <>
      <div className="offres__tete">
        <p className="surtitre">Offres</p>
        <h1>Gratuit pour les habitants, sur mesure pour les organisations.</h1>
        <p>Prix indicatifs pour la démonstration. Aucun paiement n'est possible sur ce prototype.</p>
      </div>
      <div className="offres">
        {OFFRES.map(o => (
          <Panneau key={o.nom} className={`offre ${o.phare ? 'offre--phare' : ''}`}>
            <span className="espace-carte__icone"><Icone nom={o.icone} taille={22} /></span>
            <div>
              <p className="surtitre">{o.pour}</p>
              <h2 style={{ marginTop: 6 }}>{o.nom}</h2>
            </div>
            <p className="offre__prix chiffre">{o.prix}{o.unite && <small>{o.unite}</small>}</p>
            <ul>{o.points.map(pt => <li key={pt}>{pt}</li>)}</ul>
          </Panneau>
        ))}
      </div>
      <p className="offres__note">Dans cette démonstration, les appareils et les données sont simulés ; la connexion réelle d'appareils et de compteurs fait partie de la feuille de route.</p>
    </>
  )
}
