# Trace de session — skill + hook visibles

Date : 2026-08-14  
Projet : `crappy-coffee`  
Objectif : vérifier le livrable agent (CLAUDE.md → skill → générateur → hook PostToolUse).

## 1. Prompt (cas évalué #1)

> Crée un composant client OrderCard pour afficher le nom et le prix d'une commande.

## 2. Skill déclenché

Claude charge `.claude/skills/scaffold-component/SKILL.md` (description : create/generate/scaffold component|page ; pas pour un fix d'existant).

Action retenue : `npm run g:c OrderCard` — pas d'écriture manuelle de l'arborescence.

```text
$ npm run g:c OrderCard

> my-next-template@0.1.0 g:c
> bash scripts/create-component.sh c OrderCard

Component OrderCard created in components/ordercard ✅
```

Fichiers produits (minuscules, comme prévu par le piège CLAUDE.md) :

```text
components/ordercard/
  ordercard.tsx
  ordercard.types.ts
  ordercard.hooks.ts
  ordercard.css
```

## 3. Hook PostToolUse visible

Après un `Write` volontairement sale (variable inutilisée) pour démontrer le hook :

**Événement** : `PostToolUse` · matcher `Edit|Write|MultiEdit`  
**Commande** : `node .claude/hooks/lint-on-edit.mjs`

Payload stdin (extrait) :

```json
{
  "session_id": "trace-2026-08-14",
  "hook_event_name": "PostToolUse",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/home/orson/Projects/crappy-coffee/app/hook-demo-bad.tsx"
  }
}
```

**Sortie stderr du hook** (exit code `2` — bloquant pour Claude) :

```text
ESLint a trouvé 1 problème(s) dans /home/orson/Projects/crappy-coffee/app/hook-demo-bad.tsx (0 erreur(s), 1 warning(s)) — corrige-les avant de continuer :


/home/orson/Projects/crappy-coffee/app/hook-demo-bad.tsx
  2:9  warning  'unused' is assigned a value but never used  @typescript-eslint/no-unused-vars

✖ 1 problem (0 errors, 1 warning)
```

Après correction / suppression du fichier de démo, même hook sur `components/ordercard/ordercard.tsx` → **exit `0`** (rien à signaler).

## 4. Permissions deny (contrôle hors session)

Règles actives dans `.claude/settings.json` (enforced par le harness, pas par le modèle) :

- `Read`/`Edit` `.env` / `.env.*`
- `Bash(git push --force *)`, `Bash(git push -f *)`
- `Bash(git reset --hard *)`
- `Bash(rm -rf /|~|.)`

Un `git push --force` serait refusé avant exécution ; non rejoué ici pour éviter tout effet de bord.

## 5. Verdict cas #1

| Assertion (evals.json) | Résultat |
|---|---|
| Commande `npm run g:c OrderCard` | PASS |
| Pas de scaffold à la main avant le générateur | PASS |
| Fichiers sous `components/ordercard/` | PASS |
| Export nommé `OrderCard` | PASS |

Hook : PASS (stderr visible + exit 2 sur lint sale, exit 0 sur lint propre).

Preuves brutes rejouables : `docs/evidence/hook-stderr.txt` + `docs/evidence/hook-exit-code.txt` (`2`).
