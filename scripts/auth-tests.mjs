import { readFileSync } from "node:fs";

const files = [
  "app/api/admin/login/route.ts",
  "app/api/liens/route.ts",
  "app/api/transform/route.ts",
  "app/api/signup-events/route.ts",
  "app/api/admin/liens/export/route.ts",
  "app/api/admin/liens/route.ts",
  "app/api/lien/avatar/route.ts",
  "next.config.ts",
  "supabase/schema.sql",
  "lib/lien-session.ts",
  "lib/permanent-identity.ts",
  "lib/content.ts",
  "supabase/migrations/20260802_den_guardian_permissions.sql",
  ".gitignore",
];

const content = Object.fromEntries(files.map((file) => [file, readFileSync(file, "utf8")]));
const checks = [
  [content["app/api/admin/login/route.ts"].includes("rateLimit"), "admin login is rate limited"],
  [content["app/api/admin/login/route.ts"].includes("createAdminSession"), "admin session cookie is created"],
  [content["app/api/liens/route.ts"].includes("Public LIEN enumeration is disabled"), "public enumeration is blocked"],
  [content["app/api/liens/route.ts"].includes('existingRole?.role === "DEN Guardian"'), "public saves preserve locked Guardian status"],
  [content["app/api/transform/route.ts"].includes("validatePortrait"), "portrait validation is enforced"],
  [content["app/api/transform/route.ts"].includes("assertSameOrigin"), "transform route checks same-origin"],
  [content["app/api/signup-events/route.ts"].includes("assertSameOrigin"), "signup tracking checks same-origin"],
  [content["app/api/admin/liens/export/route.ts"].includes("hasLienAdminAccess"), "CSV export is admin protected"],
  [content["app/api/admin/liens/route.ts"].includes("hasLienAdminAccess"), "Guardian assignment is admin protected"],
  [content["app/api/admin/liens/route.ts"].includes("set_den_guardian_status"), "Guardian assignment uses the audited database operation"],
  [content["app/api/lien/avatar/route.ts"].includes("publicRoleSchema"), "avatar bridge rejects protected roles"],
  [content["lib/content.ts"].includes('seasonOneRoles = ["Builder", "Creator", "Strategist"]'), "only three roles are publicly selectable"],
  [content["supabase/migrations/20260802_den_guardian_permissions.sql"].includes("lien_role_audit"), "Guardian role changes are audit logged"],
  [content["supabase/migrations/20260802_den_guardian_permissions.sql"].includes("to service_role"), "Guardian database operation is service-role only"],
  [content["next.config.ts"].includes("Content-Security-Policy"), "CSP header is configured"],
  [content["next.config.ts"].includes("frame-ancestors 'none'"), "frame ancestors are denied"],
  [content["supabase/schema.sql"].includes("enable row level security"), "Supabase RLS is enabled"],
  [content["supabase/schema.sql"].includes("resolve_telegram_identity"), "permanent identity resolver exists"],
  [content["supabase/schema.sql"].includes("grant execute on function public.resolve_telegram_identity"), "identity resolver is service-role only"],
  [content["lib/lien-session.ts"].includes("legacyPlayerId"), "legacy Telegram player bridge remains compatible"],
  [content["lib/lien-session.ts"].includes("userId?: string"), "sessions support permanent user UUIDs"],
  [content["lib/permanent-identity.ts"].includes("resolveTelegramIdentity"), "Telegram login resolves a permanent identity"],
  [content[".gitignore"].includes(".env*"), ".env files are ignored"],
];

const failures = checks.filter(([pass]) => !pass).map(([, label]) => label);
if (failures.length) {
  console.error(`Authorization/security tests failed:\n${failures.join("\n")}`);
  process.exit(1);
}

console.log("Authorization/security tests passed.");
