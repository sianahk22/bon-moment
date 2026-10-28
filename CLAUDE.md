# CLAUDE.md — Le Bon Moment (démo hackathon)

## Ce qu'on construit

Un **site web de démonstration** pour un hackathon, pas une application commerciale.
Le jury verra un parcours de 3 minutes. Seul ce parcours doit fonctionner parfaitement.
Tout le reste peut utiliser des données de démonstration, à condition qu'elles soient signalées.

**Le Bon Moment** est le pilote automatique de l'énergie d'un quartier : l'utilisateur dit
**pour quand** il a besoin de quelque chose (voiture chargée à 7 h, linge propre avant 18 h),
et l'application choisit le meilleur moment, quand le soleil des panneaux partagés du quartier
produit, quand l'électricité est la moins polluante et la moins chère. Elle coordonne aussi tous
les voisins ensemble. Priorité : d'abord l'écologie, puis les économies.

## Règles de travail (à respecter à chaque demande)

- **Une demande = une petite tâche.** Ne construis jamais toute l'application d'un coup.
- Après chaque tâche : lance l'application (`npm run dev`), vérifie qu'elle compile et
  qu'il n'y a pas d'erreur dans la console, puis résume en 3 lignes ce qui a changé.
- Ne modifie pas les fichiers du dossier `reference/`.
- Ne change pas un calcul du moteur sans me le signaler.
- Pas de vraie authentification, pas de paiement, pas de base de données, pas de backend.
- Si un bug résiste plus de 15 minutes, arrête-toi et propose une solution plus simple.

## Stack (unique et simple)

- React + Vite + TypeScript, react-router-dom.
- 3D : three.js via npm (ou React Three Fiber si c'est plus simple), aucune bibliothèque chargée par CDN.
- Graphiques en SVG simple.
- Données dans des fichiers `src/data/*.ts` (ou JSON). Aucun appel réseau obligatoire.
- Déploiement sur Vercel (`vercel.json` avec réécriture vers `index.html`).

## Références

- `reference/app-base.html` : la référence pour le **contenu et la logique**.
- `reference/inspiration/` : la référence pour le **style visuel** uniquement (voir « Direction visuelle »).

Elle contient :
- le **moteur à conserver** : fonctions `plan`, `slotScore`, `evaluate`, `quartierSim`, les 3 scénarios
  (été/jour bleu, hiver/jour blanc, hiver tendu/jour rouge, avec les vrais tarifs Tempo TTC du
  1er août 2026), les tâches des personas et des 30 foyers simulés ;
- la scène 3D du quartier, les statistiques et les graphiques ;
- les couleurs repères à garder : soleil (jaune/ambre) et réseau (bleu-vert), et la police mono
  (IBM Plex Mono) pour les chiffres. Le reste du design est remplacé par le style smart city.

## Direction visuelle : un style « smart city / jumeau numérique » moderne et homogène

**Répartition des rôles :**
- `reference/app-base.html` donne le **contenu** : fonctionnalités, données, calculs, écrans.
- `reference/inspiration/` contient des images de dashboards « Smart City Digital Twin »
  (Dribbble, Pinterest). Elles donnent **uniquement le style visuel**. Ne copie ni leur contenu,
  ni leurs textes, ni leurs logos, ni leur mise en page à l'identique : reprends leur langage
  visuel et applique-le à notre contenu.

**Le style à obtenir, le même dans les 4 espaces (homogène) :**
- Ambiance « centre de contrôle » d'une ville intelligente : fond bleu nuit profond, la ville 3D
  ou la donnée au centre, des **panneaux d'information flottants** autour.
- Panneaux sombres légèrement transparents, fines bordures lumineuses, coins arrondis réguliers.
- Nos deux couleurs repères gardées et mises en lumière : **ambre/jaune = soleil**,
  **cyan/bleu-vert = réseau** ; vert pour « bon moment », rouge pour « à éviter ». Pas d'autres accents.
- Widgets compacts : chiffre clé en grand (police mono), petit libellé, mini-graphique ou jauge.
- Graphiques fins et lumineux sur fond sombre, avec légendes lisibles.
- Lueurs (glow) et transparence **avec retenue** : seulement sur les éléments importants
  (soleil qui produit, flux d'énergie, alertes).
- Même grille, mêmes composants, mêmes icônes et mêmes espacements dans tous les espaces.
  Chaque espace adapte seulement la densité : Habitant simple et lisible sur téléphone,
  Premium plus riche, Entreprise plus chiffrée, Ville en plein écran autour de la 3D.

**Clarté avant tout**
- Contraste élevé : texte clair sur fond sombre, jamais de texte gris sur gris.
- Une information principale par panneau, des titres courts.
- Une hiérarchie nette : le chiffre clé en grand, l'explication en petit.

**Moderne et original, sans « look généré par IA »**
- À éviter : dégradés violets génériques, effets de verre sur tous les éléments, grilles de cartes
  toutes identiques, emojis comme icônes, ombres lourdes, textes de remplissage marketing.
- Créer une **signature visuelle propre** au projet, utilisée avec retenue, par exemple :
  un **arc du soleil** (la courbe de la journée de 8 h à 8 h) qui revient comme motif dans
  les plannings, les en-têtes et les chargements ; des pastilles de couleur « bon moment /
  moment à éviter » cohérentes partout.
- Icônes dessinées en SVG, au trait, toutes dans le même style.
- Des micro-animations utiles (une tâche qui glisse vers son nouveau créneau, un chiffre qui
  se met à jour), jamais décoratives en continu.
- Une personnalité par espace, dans le même style smart city sombre :
  - Habitant Gratuit : simple et lisible, pensé d'abord pour le téléphone ;
  - Habitant Premium : plus riche, la voiture électrique mise en avant ;
  - Entreprise : précis, orienté chiffres ;
  - Ville : la vitrine, la 3D en plein écran entourée de panneaux flottants.

## La ville 3D (à améliorer fortement)

Pars de la scène 3D de l'application de base (gymnase solaire, école, commerce, logements,
maisons, poste électrique, bornes, particules jaunes = soleil local, bleues = réseau, cycle
jour/nuit, labels) et rends-la nettement plus belle et plus « smart city » :

- un quartier plus riche : bâtiments variés, rues, trottoirs, arbres, parc, place ;
- des panneaux solaires sur plusieurs toits (gymnase, école, ombrières du parking quand on les active
  dans le simulateur), qui brillent selon la production ;
- des **flux d'énergie visibles** (lignes ou particules) du gymnase vers les bâtiments et du poste
  vers le quartier ;
- quelques voitures qui circulent et des voitures branchées aux bornes qui s'allument pendant la recharge ;
- un vrai nuage qui passe au-dessus du quartier quand on clique sur « Un nuage arrive » ;
- un ciel, une lumière et des ombres qui suivent l'heure ; fenêtres allumées le soir ;
- des bâtiments cliquables : une carte d'info s'ouvre (nom, consommation, part de soleil local) ;
- 2 ou 3 vues de caméra (vue d'ensemble, gymnase, rue) avec transition fluide ;
- la scène doit rester fluide : nombre de particules limité, ombres raisonnables,
  la 3D se charge seulement quand l'onglet Ville 3D est affiché.

Tous les effets visuels restent reliés au moteur : la 3D montre les vrais résultats de la simulation.

## Le moteur (la seule chose qui doit vraiment marcher)

- La journée est découpée en 48 créneaux de 30 minutes, de 8 h à 8 h le lendemain.
- Chaque tâche a : un appareil, une puissance, une durée, une **échéance**, et peut être
  coupée en morceaux ou non (une machine à laver non, une voiture oui).
- Le moteur note chaque créneau (prix, CO₂, tension du réseau, soleil du quartier disponible,
  pénalité si on dépasse la capacité du poste) et place chaque tâche au meilleur moment avant
  son échéance.
- Il doit **recalculer en direct** quand :
  1. l'utilisateur ajoute ou retire un besoin ;
  2. un nuage arrive (production solaire divisée par ~3 entre 11 h 30 et 15 h 30) ;
  3. on change de scénario ou on active/désactive la coordination.
- C'est un algorithme glouton simplifié : ne l'appelle pas « OR-Tools » dans l'interface.
- Mets-le dans `src/engine/` et utilise-le dans tous les espaces (aucune duplication).

## Les personas (remplacent ceux de l'application de base)

| Espace | Persona | Remplace dans la base |
| --- | --- | --- |
| Habitant Gratuit | **Anaïs**, habitante sans voiture électrique | nouveau profil |
| Habitant Premium | **Inès**, voiture électrique et borne | Inès (garder ses tâches) |
| Entreprise | **Lily**, boulangerie (« Boulangerie de Lily ») | Karim (renommer partout : code, textes, simulateur, labels 3D) |
| Ville | **Sophie**, Mairie de Montreuil | Sophie |

Le nom « Karim » ne doit plus apparaître nulle part.

## Les 4 espaces (choix du profil sur l'écran d'accueil)

L'écran d'accueil propose les 4 profils de démonstration déjà remplis, en un clic.
Un champ facultatif « Votre prénom » remplace seulement le prénom affiché (« Bonjour … »).

1. **Habitant · Gratuit** (Anaïs)
   - Onglets : Moments, Planning, Appareils, Bilan.
   - Moments : les meilleurs moments du jour, avec une explication simple.
   - Planning : ajouter un besoin (appareil + échéance) → créneau choisi + alternatives.
   - Rappels au bon moment pour les appareils non connectés.
   - 2 appareils connectés maximum (au-delà : message qui présente le Premium).
   - Bilan : économie, CO₂ évité, part du soleil du quartier.
2. **Habitant · Premium, 3,99 €** (Inès)
   - Tout le Gratuit + pilotage automatique illimité (voiture, borne, chauffe-eau…).
   - Curseur « économies / écologie » qui change le planning en direct.
   - Planning détaillé en lignes du temps (comme dans l'application de base).
   - Bilan mensuel (données de démonstration).
3. **Entreprise · Pro** (Lily, boulangerie)
   - Onglets : Moments, Planning, Équipements, Bilan.
   - Équipements pro : chambre froide, utilitaire de livraison, fours, eau chaude.
   - Contraintes métier : ouverture à 4 h, pré-refroidissement, livraisons.
   - Bilan : facture, économies, part de soleil local, pic par rapport à l'abonnement.
4. **Ville · Collectivité** (Sophie, Mairie de Montreuil) — l'écran vitrine
   - Onglets : Moments, Ville 3D, Équipements, Bilan.
   - Ville 3D : la scène 3D améliorée (voir « La ville 3D »), en grand, avec la barre d'infos
     (soleil, conso, part locale, réseau), le curseur d'heure + lecture, l'interrupteur
     « Coordination Le Bon Moment », le bouton « Un nuage arrive », la comparaison
     sans/avec (taux d'autoconsommation, pic sur le poste) et le graphique production/consommation.
   - Simulateur : école, boulangerie de Lily, ombrières solaires du parking (+30 kWc).
   - Bâtiments municipaux planifiés et bornes publiques.

Une page **Offres** présente : Gratuit (0 €), Premium (3,99 €, périodicité à confirmer),
Entreprise (sur devis), Ville (licence annuelle). Pas de paiement.

## Honnêteté des données (obligatoire)

- Bandeau discret « Données de démonstration » sur chaque écran qui utilise des données simulées.
- Seuls les tarifs Tempo sont réels : garder la mention en pied de page.
- Ne jamais présenter une simulation comme une mesure réelle ou un appareil vraiment connecté.

## Le parcours de démo (3 minutes, doit marcher parfaitement)

1. Accueil → clic sur **Habitant Premium** (Inès).
2. Planning : ajouter « Voiture chargée pour 7 h » → la tâche se place sur le meilleur créneau,
   l'économie et le CO₂ évité se mettent à jour.
3. Retour accueil → clic sur **Ville** (Sophie) → Ville 3D.
4. Lancer la lecture de la journée, puis cliquer **« Un nuage arrive »** → toutes les tâches
   du quartier se réorganisent, les chiffres changent.
5. Désactiver puis réactiver **la coordination** → la comparaison sans/avec prouve l'utilité.

## Ce qu'on ne fait pas

Vraie connexion d'appareils, vrais compteurs, vraie carte géographique, comptes et rôles,
multi-organisations, paiement, backend. Ces sujets sont la feuille de route après le hackathon.
