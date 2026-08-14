---
name: scaffold-component
description: >
  Scaffolds a Next.js App Router component or page with this repo's generator
  (npm run g:c / g:p), never by hand-writing files. Use when the user asks to
  create, generate, scaffold, or add a component, page, route, or UI module
  (e.g. "crée un composant OrderCard", "ajoute la page produit/[id]",
  "génère un client component"). Do not use for editing an existing file,
  restyling, refactoring, or fixing bugs in code that already exists.
---

# Scaffolder un composant ou une page

Ce repo a son propre générateur (`scripts/create-component.sh`, exposé via
`npm run g:c` / `npm run g:p`). N'écris jamais un composant ou une page à la
main : lance le script, puis remplis les fichiers générés. Ça garantit que
tout le monde (humains et agents) produit la même structure de fichiers.

## Choisir la commande

| Besoin | Commande | Résultat |
|---|---|---|
| Composant client (`"use client"`) | `npm run g:c Nom` | `components/nom/` |
| Page serveur | `npm run g:p Nom` | `app/nom/page.tsx` |
| Page dynamique avec paramètre | `npm run g:p nom/param` | `app/nom/[param]/page.tsx` |

Exemple : `npm run g:p produit/id` crée `app/produit/[id]/page.tsx` avec un
type `ProduitProps` contenant `params: { id: string }`.

## Piège de nommage à connaître

Le script met en minuscules le nom du **dossier/fichier**, mais garde la
casse du reste du **nom de fonction/composant** — il ne fait que capitaliser
la première lettre. Résultat :

- Passe l'argument déjà en PascalCase (`OrderCard`, pas `ordercard` ni
  `order-card`) pour obtenir un nom de composant exporté lisible.
- Le dossier/fichier sera quand même tout en minuscules (`components/ordercard/ordercard.tsx`)
  — c'est normal, ne renomme pas après coup, ça casserait les imports générés
  (`./ordercard.types`, `./ordercard.hooks`, `./ordercard.css`).
- `TYPE` doit être exactement `c` ou `p` (une lettre), pas `component`/`page`.

## Après la génération

Le script crée des fichiers volontairement vides à compléter — ce ne sont
pas des stubs morts à supprimer :

1. `<nom>.types.ts` — remplace le commentaire `// Define your props here` par
   les vraies props.
2. `<nom>.hooks.ts` (composants client uniquement) — remplace le
   `useState(null)` par la vraie logique d'état.
3. `<nom>.css` — adapte au style déjà utilisé autour du code que tu modifies
   (le repo mélange Tailwind et CSS par composant selon les fichiers).
4. Relis le fichier `.tsx` généré : les pages dynamiques attendent
   `params`/`searchParams` en `Promise` (Next.js 16 App Router) — voir
   AGENTS.md avant de changer cette signature.

Un hook post-édition relance ESLint sur chaque fichier `.ts/.tsx/.js/.jsx`
modifié ; corrige ce qu'il signale avant de continuer.

## Cas d'évaluation

Voir `evals/evals.json` : prompts should-trigger / should-not-trigger et
comportement attendu (lancer le générateur, PascalCase, ne pas écrire à la main).
