import type { LienProfile } from "@/lib/lien-session";

export type MissionControlTransaction = {
  id: string;
  amount: number;
  reason: string;
  balanceAfter: number;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type MissionControlSnapshot = {
  rank: number | null;
  transactions: MissionControlTransaction[];
};

export type MissionView = {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  status: "active" | "completed" | "locked";
  rewardLabel: string;
};

export const achievementDefinitions: Record<string, { name: string; description: string; scope: "lifetime" | "season" }> = {
  "first-ascension": { name: "Ascended", description: "Reached a new LIEN level.", scope: "lifetime" },
  "first-signal-lock-win": { name: "Signal Locked", description: "Won a verified Signal Lock round.", scope: "lifetime" },
};

export function missionsFor(profile: LienProfile): MissionView[] {
  const signal = profile.gameStats?.["signal-lock"];
  const drift = profile.gameStats?.["lien-drift"];
  const played = (signal?.played || 0) + (drift?.played || 0);
  return [
    {
      id: "first-game",
      title: "First Signal",
      description: "Complete one verified LIENIVERSE game run.",
      progress: Math.min(1, played), target: 1,
      status: played >= 1 ? "completed" : "active",
      rewardLabel: "Progress is awarded by the game event",
    },
    {
      id: "signal-lock-three",
      title: "Lock the Signal",
      description: "Complete three verified Signal Lock rounds.",
      progress: Math.min(3, signal?.played || 0), target: 3,
      status: (signal?.played || 0) >= 3 ? "completed" : "active",
      rewardLabel: "Game rewards apply per verified round",
    },
    {
      id: "drift-clear",
      title: "Clear the Corridor",
      description: "Complete one verified LIEN DRIFT corridor clear.",
      progress: Math.min(1, drift?.clears || 0), target: 1,
      status: (drift?.clears || 0) >= 1 ? "completed" : "active",
      rewardLabel: "100 GLB / 40 XP from the verified clear",
    },
  ];
}

export const seasonTrack = [
  { level: 1, label: "First Signal badge", status: "active" as const },
  { level: 2, label: "Season milestone", status: "planned" as const },
  { level: 3, label: "Card cosmetic slot", status: "planned" as const },
  { level: 5, label: "Rare card effect slot", status: "planned" as const },
];
