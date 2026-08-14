# Crappucino

Template Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4, configuré pour travailler avec **Claude Code** : fiche agent (`CLAUDE.md`), skill d'équipe, hook lint, et permissions en deny.

## Démarrage

```bash
npm install
npm run dev
```

Autres commandes utiles : `npm run build` · `npm run lint` · `npx tsc --noEmit`. Pas de suite de tests pour l'instant.

Nouveau composant / page : **toujours** via le générateur —

```bash
npm run g:c OrderCard   # composant client
npm run g:p menu        # page serveur
npm run g:p produit/id  # page dynamique
```

## Pourquoi cette config agent

Trois couches, trois jobs différents :

| Couche | Fichier | Rôle |
|---|---|---|
| Conseil | `CLAUDE.md` | Stack, commandes, 3 conventions, 1 piège — court et actionnable |
| Procédure | skill `scaffold-component` | Comment scaffolder (le modèle peut l'oublier sans skill) |
| Enforcement | hook + `permissions.deny` | Ce qui doit arriver / être bloqué quoi que dise le modèle |

### Skill `scaffold-component`

Sans skill, l'agent invente souvent sa propre arborescence (`components/OrderCard.tsx` à la racine, kebab-case, oubli du `.hooks.ts`). Le générateur du repo impose une forme unique (`file` + `css` + `types` + `hooks` pour les clients).

La **description** du skill est volontairement précise : déclencheurs (`crée`, `génère`, `ajoute une page`…) et **contre-déclencheurs** (édition / fix / refactor d'existant). Un cas évalué (et deux autres) vivent dans `.claude/skills/scaffold-component/evals/evals.json` — dont le cas #1 (`OrderCard`) a été exécuté : voir `docs/session-trace.md`.

### Hook PostToolUse (`lint-on-edit`)

Le lint dans `CLAUDE.md` est du conseil. Le hook dans `.claude/settings.json` (matcher `Edit|Write|MultiEdit`) est **déterministe** : après chaque écriture, `node .claude/hooks/lint-on-edit.mjs` relance ESLint sur le fichier touché. Exit `2` + stderr → Claude doit corriger avant de continuer. On a choisi PostToolUse (qualité après coup) plutôt qu'un PreToolUse garde-fou, parce que le risque principal ici n'est pas une commande dangereuse mais du code qui ne passe pas la CI locale.

### Permissions en `deny`

Le hook ne remplace pas les permissions. Dans `.claude/settings.json` :

- `Read` / `Edit` sur `.env` / `.env.*` — secrets hors contexte agent
- `git push --force` / `-f`, `git reset --hard`, `rm -rf /|~|.` — destructions irréversibles bloquées au harness, pas au prompt

`deny` est évalué par Claude Code **avant** que le modèle décide : plus fiable qu'une ligne « ne fais jamais force push » dans `CLAUDE.md`.

## Trace

Une session où skill + générateur + hook sont visibles : [`docs/session-trace.md`](docs/session-trace.md).
