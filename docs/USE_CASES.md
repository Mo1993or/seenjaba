# seenjaba — Cas d'utilisation

## Acteurs
- Visiteur / client invité : consulte le catalogue et peut commander sans compte.
- Client connecté (optionnel) : conserve ses coordonnées, adresses et historique.
- Administrateur : gère le catalogue, les commandes, les stocks, les promotions et les paramètres.
- Prestataire de paiement : Wave / Orange Money / carte (intégration ultérieure).
- Service de livraison : statut de préparation et livraison (processus à définir).

## Parcours client
1. Ouvrir l'accueil et parcourir les catégories.
2. Rechercher ou filtrer les produits.
3. Ouvrir une fiche, choisir quantité/unité et ajouter au panier.
4. Vérifier le panier.
5. Saisir nom, téléphone, adresse, zone et note de livraison.
6. Choisir le mode de paiement disponible.
7. Confirmer la commande et recevoir une référence.
8. Consulter le statut de commande via référence + téléphone (fonctionnalité backend à construire).

## Parcours administrateur
1. Se connecter via Supabase Auth.
2. Consulter les indicateurs et commandes à traiter.
3. Ouvrir une commande, vérifier les coordonnées et les lignes.
4. Valider ou annuler la commande.
5. Faire évoluer le statut : confirmée → préparation → prête → expédiée → livrée.
6. Créer/modifier/désactiver un produit.
7. Gérer catégories et sous-catégories.
8. Ajuster le stock et consulter l'historique des mouvements.
9. Créer une promotion et l'associer à des produits.
10. Modifier les paramètres de livraison et de boutique.

## Règles métier initiales
- Prix en FCFA (XOF), enregistrés en numeric(12,2).
- Une commande invité est autorisée : customer_id nullable, nom/téléphone/adresse obligatoires.
- Les lignes de commande gardent un snapshot du nom, prix, unité et image au moment de l'achat.
- Le stock ne doit être décrémenté qu'une seule fois lors de la confirmation métier choisie.
- Les changements de statut doivent être tracés côté serveur dans une prochaine migration.
- Un administrateur seul peut écrire dans le catalogue et valider les commandes.
- Les clés secrètes ne sont jamais intégrées dans le bundle Angular.

## Diagramme de relations (simplifié)
- profiles 1—N addresses
- profiles 1—N orders (facultatif pour les invités)
- categories 1—N categories (parent/enfant)
- categories 1—N products
- products 1—N product_images
- products 1—1 inventory
- products 1—N inventory_movements
- orders 1—N order_items
- orders 1—N payments
- promotions N—N products via promotion_products

## À décider avant mise en production
- Zones et frais de livraison, minimum de commande, horaires.
- Vente au poids : quantité décimale (kg) et règles d'arrondi.
- Paiement à la livraison ou intégration Wave / Orange Money.
- Politique de retour/remboursement et rupture après commande.
- Livraison propre ou partenaire.
- Méthode de suivi des commandes invitées.
