import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const ignored = new Set(["node_modules", ".next", ".git", ".gitlocal", "deploy-kit"]);
const secretPatterns = [
  /sk-[A-Za-z0-9_-]{20,}/,
  /SUPABASE_SERVICE_ROLE_KEY[ \t]*=[ \t]*[^\r\n]+/,
  /OPENAI_API_KEY\s*=\s*sk-/,
  /ADMIN_ACCESS_CODE[ \t]*=[ \t]*[^\r\n]{8,}/,
  /NEW_LIEN_WEBHOOK_URL[ \t]*=[ \t]*https?:\/\//,
];

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (ignored.has(name)) return [];
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) return files(path);
    if (stat.size > 5_000_000) return [];
    return [path];
  });
}

const findings = [];
for (const file of files(root)) {
  const text = readFileSync(file, "utf8");
  for (const pattern of secretPatterns) {
    if (pattern.test(text)) findings.push(file.replace(`${root}\\`, ""));
  }
}

if (findings.length) {
  console.error(`Potential secrets found:\n${[...new Set(findings)].join("\n")}`);
  process.exit(1);
}

console.log("Secret scan passed.");
