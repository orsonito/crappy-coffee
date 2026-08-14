@AGENTS.md

# Crappucino — Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4

## Commandes

- Build / run : `npm run build` · `npm run start` · `npm run dev`
- Tests : aucun — ne pas inventer `npm test`
- Lint : `npm run lint` (bloquant ; le hook PostToolUse relance ESLint après chaque édition)
- Typecheck : `npx tsc --noEmit` (pas de script dédié)
- Nouveau composant / page : `npm run g:c Nom` ou `npm run g:p Nom` (skill `scaffold-component`)

## Conventions

- Alias `@/*` → racine du repo (`tsconfig.json`)
- Ne jamais créer un composant ou une page à la main : toujours `npm run g:c` / `g:p` puis remplir les fichiers générés
- Stubs volontaires à remplir, pas à supprimer : `config/env.ts`, `lib/api.ts`, `utils/cn.ts`, `constants/routes.ts`

## Pièges connus

- Le générateur minuscule le dossier/fichier mais garde la casse du nom de composant : passer du PascalCase (`OrderCard`), ne pas renommer après coup
