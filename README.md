# seenjaba

Plateforme e-commerce de produits frais et de consommation, avec boutique publique et dashboard administrateur Angular + Supabase.

## Démarrer en local
Prérequis : Node.js LTS et npm.

```bash
npm install
npm start
```
Puis ouvrir http://localhost:4200.

## Ce qui est déjà préparé
- Boutique responsive avec accueil, catégories, grille de produits et fiches.
- Panier local de démonstration.
- Dashboard admin : vue d'ensemble, commandes, produits, catégories, stocks, paramètres.
- Jeu de données de démonstration.
- Service Supabase prêt à initialiser.
- Schéma SQL initial, relations, index et politiques RLS dans `supabase/schema.sql`.
- Cas d'utilisation et règles métier dans `docs/USE_CASES.md`.

## Configuration Supabase (prochaine séance)
1. Créer le projet Supabase.
2. Ouvrir SQL Editor et examiner/exécuter `supabase/schema.sql`.
3. Exécuter `supabase/seed.sql`.
4. Créer le bucket Storage `product-images` (public pour les images catalogue, écriture admin uniquement).
5. Récupérer Project URL et anon/public key.
6. Renseigner `src/environments/environment.ts`.
7. Mettre en place l'auth admin et la création sécurisée du premier profil admin.
8. Remplacer progressivement les données de démonstration par les requêtes Supabase.

**Sécurité :** ne jamais mettre `service_role` dans Angular. La clé anon/public est faite pour le navigateur uniquement avec RLS correctement configuré. Les commandes invitées et les opérations atomiques de stock devront être réalisées via RPC/Edge Function sécurisée.

## Structure
```text
seenjaba/
├── docs/USE_CASES.md
├── supabase/schema.sql
├── supabase/seed.sql
└── src/
    ├── app/
    │   ├── data/
    │   ├── models/
    │   ├── pages/
    │   └── services/
    └── environments/
```

## État du projet
Le frontend livré est un starter fonctionnel orienté démonstration : les données boutique et dashboard sont statiques. Le service Supabase et le schéma sont préparés, mais l'authentification, les mutations et la validation réelle des commandes ne sont pas encore branchées. Ne pas utiliser en production avant les étapes de sécurité et d'intégration.
