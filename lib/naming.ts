export function sanitizeUserText(value: string) {
  return value.replace(/[<>&"']/g, (char) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "\"": "&quot;",
    "'": "&#39;",
  })[char] ?? char).trim();
}

export function makeLienName(humanName: string) {
  const clean = sanitizeUserText(humanName).replace(/[^a-zA-Z]/g, "");
  if (!clean) return "NewLien";
  if (clean.toLowerCase().endsWith("d")) return `${clean.slice(0, -1)}Lien`;
  if (clean.length <= 4) return `${clean}Lien`;
  return `${clean.slice(0, Math.max(3, clean.length - 2))}Lien`;
}
