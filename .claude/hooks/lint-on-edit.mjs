#!/usr/bin/env node
// PostToolUse hook (Edit|Write|MultiEdit): relint the file Claude just touched
// and hand ESLint errors back to Claude (exit 2 + stderr) so it can fix them
// before moving on. Uses the ESLint Node API directly so it always resolves
// the same eslint.config.mjs the team uses, on Windows or WSL, no shell/npx.

const LINTABLE = /\.(ts|tsx|js|jsx|mjs|cjs)$/;

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
  });
}

async function main() {
  const raw = await readStdin();

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const filePath = payload?.tool_input?.file_path;
  if (!filePath || !LINTABLE.test(filePath) || filePath.includes("node_modules")) {
    process.exit(0);
  }

  try {
    // Dynamic import so a missing eslint install is handled below (exit 0),
    // not as an uncaught top-level crash (exit 1).
    const { ESLint } = await import("eslint");
    const eslint = new ESLint({ cwd: process.cwd() });

    if (await eslint.isPathIgnored(filePath)) {
      process.exit(0);
    }

    const results = await eslint.lintFiles([filePath]);
    const errorCount = results.reduce((n, r) => n + r.errorCount, 0);
    const warningCount = results.reduce((n, r) => n + r.warningCount, 0);
    const problemCount = errorCount + warningCount;

    if (problemCount === 0) {
      process.exit(0);
    }

    const formatter = await eslint.loadFormatter("stylish");
    const output = await formatter.format(results);
    process.stderr.write(
      `ESLint a trouvé ${problemCount} problème(s) dans ${filePath} (${errorCount} erreur(s), ${warningCount} warning(s)) — corrige-les avant de continuer :\n\n${output}\n`
    );
    process.exit(2);
  } catch (err) {
    // Infra failure (eslint misconfigured, file already deleted, ...): warn but
    // don't block the session on something unrelated to the actual edit.
    process.stderr.write(`lint-on-edit hook: vérification ignorée (${err.message})\n`);
    process.exit(0);
  }
}

main();
