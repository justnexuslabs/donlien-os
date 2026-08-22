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

/**
 * Issues a non-editable, permanent LIEN designation tied to the permanent
 * LIEN ID. The ID suffix prevents collisions while the normalized name keeps
 * every public designation visibly inside the LIEN naming system.
 */
export function makeIssuedLienName(humanName: string, lienId: string) {
  return makeIssuedLienNameOptions(humanName, lienId)[0];
}

export function makeIssuedLienNameOptions(humanName: string, lienId: string) {
  const firstName = sanitizeUserText(humanName).trim().split(/\s+/)[0] || "New";
  const clean = firstName.replace(/[^a-zA-Z0-9]/g, "").replace(/lien$/i, "") || "New";
  const suffix = lienId.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase() || "0000";
  const base = clean.slice(0, 16);
  return [
    `${base}Lien-${suffix}`,
    `Lien${base}-${suffix}`,
    `${base}SignalLien-${suffix}`,
  ] as const;
}

export function resolveIssuedLienName(humanName: string, lienId: string, requested?: unknown) {
  const options = makeIssuedLienNameOptions(humanName, lienId);
  return typeof requested === "string" && options.includes(requested as (typeof options)[number])
    ? requested
    : options[0];
}
