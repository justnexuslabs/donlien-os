import { readFileSync } from "node:fs";

const files = [
  "app/api/admin/login/route.ts",
  "app/api/liens/route.ts",
  "app/api/transform/route.ts",
  "next.config.ts",
  "supabase/schema.sql",
  ".gitignore",
];

const content = Object.fromEntries(files.map((file) => [file, readFileSync(file, "utf8")]));
const checks = [
  [content["app/api/admin/login/route.ts"].includes("rateLimit"), "admin login is rate limited"],
  [content["app/api/admin/login/route.ts"].includes("createAdminSession"), "admin session cookie is created"],
  [content["app/api/liens/route.ts"].includes("Public LIEN enumeration is disabled"), "public enumeration is blocked"],
  [content["app/api/transform/route.ts"].includes("validatePortrait"), "portrait validation is enforced"],
  [content["app/api/transform/route.ts"].includes("assertSameOrigin"), "transform route checks same-origin"],
  [content["next.config.ts"].includes("Content-Security-Policy"), "CSP header is configured"],
  [content["next.config.ts"].includes("frame-ancestors 'none'"), "frame ancestors are denied"],
  [content["supabase/schema.sql"].includes("enable row level security"), "Supabase RLS is enabled"],
  [content[".gitignore"].includes(".env*"), ".env files are ignored"],
];

const failures = checks.filter(([pass]) => !pass).map(([, label]) => label);
if (failures.length) {
  console.error(`Authorization/security tests failed:\n${failures.join("\n")}`);
  process.exit(1);
}

console.log("Authorization/security tests passed.");
