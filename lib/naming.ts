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
  const firstName = sanitizeUserText(humanName).trim().split(/\s+/)[0] || "";
  const clean = firstName.replace(/[^a-zA-Z]/g, "");
  if (!clean) return "NewLien";
  if (clean.length <= 4) return `${clean}Lien`;
  return `${clean.slice(0, 3)}Lien`;
}
