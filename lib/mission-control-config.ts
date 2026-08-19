export type GameStatus = "LIVE" | "BETA" | "EARLY ACCESS" | "COMING SOON";

export type MissionControlGame = {
  gameId: string;
  name: string;
  status: GameStatus;
  route: string | null;
  image: string;
  description: string;
  enabled: boolean;
  external: boolean;
  note?: string;
};

const signalLockRoute = process.env.NEXT_PUBLIC_SIGNAL_LOCK_URL?.trim() || null;
const signalLockEnabled = process.env.NEXT_PUBLIC_SIGNAL_LOCK_ENABLED === "true";
const driftRoute =
  process.env.NEXT_PUBLIC_LIEN_DRIFT_URL?.trim() ||
  "https://lien-drift-den.netlify.app";

/** Phase A registry: add future games through configuration, not page redesign. */
export const missionControlGames: MissionControlGame[] = [
  {
    gameId: "lien-ascension",
    name: "LIEN Ascension",
    status: "LIVE",
    route: "https://t.me/LIENASCENSIONBOT/Play",
    image: "/images/mission-control-final.jpg",
    description: "Merge artifacts, complete signals, and advance your connected LIEN progression.",
    enabled: true,
    external: true,
  },
  {
    gameId: "signal-lock",
    name: "Signal Lock",
    status: "EARLY ACCESS",
    route: signalLockRoute,
    image: "/images/archive-final.jpg",
    description: "A precision signal challenge connected to the LIENIVERSE game network.",
    enabled: Boolean(signalLockRoute) && signalLockEnabled,
    external: true,
    note: signalLockEnabled && signalLockRoute
      ? "Development access — settlement and multiplayer are unfinished"
      : "In development — not yet a complete game",
  },
  {
    gameId: "lien-drift",
    name: "LIEN DRIFT",
    status: "BETA",
    route: driftRoute,
    image: "/images/genesis-final.jpg",
    description: "Navigate deterministic corridors, collect fragments, and reach the verified exit portal.",
    enabled: true,
    external: true,
    note: "Verification beta — runs require Telegram for connected progression",
  },
  {
    gameId: "unknown-signal",
    name: "Unknown Signal",
    status: "COMING SOON",
    route: null,
    image: "/images/genesis-final.jpg",
    description: "Signal classified. Additional LIENIVERSE experiences will appear here when approved.",
    enabled: false,
    external: false,
  },
];
