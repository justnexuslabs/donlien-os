import {
  Archive,
  BadgeCheck,
  BrainCircuit,
  Building2,
  Cpu,
  Diamond,
  FileSearch,
  Globe2,
  Handshake,
  LockKeyhole,
  Network,
  Radar,
  Satellite,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/mission-control", label: "Mission Control" },
  { href: "/genesis", label: "Genesis" },
  { href: "/lienity", label: "LIENITY" },
  { href: "/archive", label: "Archive" },
];

export const roles = ["Builder", "Strategist", "Diplomat", "Creator", "Explorer", "Guardian"] as const;

export const genesisStatuses = ["candidate", "eligible", "waitlisted", "claimed", "not_applied"] as const;

export const rarity = [
  { name: "Legendary", count: 5, color: "#E7BA50" },
  { name: "Mythic / Epic", count: 25, color: "#C026D3" },
  { name: "Rare", count: 30, color: "#35ECFF" },
  { name: "Uncommon", count: 90, color: "#39FF14" },
  { name: "Common", count: 150, color: "#E7ECEA" },
];

export const archiveCategories = [
  "UAP and Technology",
  "Government Files",
  "Ancient Artifacts",
  "Alien Biology",
  "Communications",
  "Genesis Records",
  "Lore Archives",
  "Classified Missions",
];

export const pillars = [
  { icon: Users, title: "Unity", copy: "One family across species, borders, and signal bands." },
  { icon: Shield, title: "Respect", copy: "Every voice enters with dignity and accountability." },
  { icon: Handshake, title: "Collaboration", copy: "Builders, diplomats, artists, and guardians work in public trust." },
  { icon: BadgeCheck, title: "Transparency", copy: "Clear records, clear provenance, clear mission status." },
];

export const homeValues = [
  { icon: Network, title: "Decentralized Networks" },
  { icon: Diamond, title: "Financial Freedom" },
  { icon: Cpu, title: "Technology For All" },
  { icon: Users, title: "Community Powered" },
];

export const missionStats = [
  { label: "Clearance Level", value: "51", copy: "Authorized LIENs only", icon: LockKeyhole },
  { label: "Active Missions", value: "07", copy: "Global operations", icon: Radar },
  { label: "Threat Level", value: "Low", copy: "All systems secure", icon: Shield },
  { label: "Location", value: "Mission Control", copy: "Earth orbital command", icon: Globe2 },
];

export const objectives = [
  "Expand LIENITY",
  "Deploy AI infrastructure",
  "Secure the network",
  "Prepare for Genesis",
];

export const liveFeeds = [
  "UAP protocol ready",
  "Satellites linked",
  "All systems online",
  "Network stable",
  "Genesis vault sealed",
  "LIENITY open",
];

export const embassyCards = [
  { title: "Culture Exchange", copy: "Translation, etiquette, rituals, and mutual respect." },
  { title: "Creator Support", copy: "Tools for LIEN artists, storytellers, and operators." },
  { title: "Global Connection", copy: "Embassy nodes designed for every region." },
  { title: "Education Access", copy: "Level 51 briefings for new civilization partners." },
];

export const archiveRecords = [
  { title: "UAP Reports", date: "05.20.2026", category: "UAP and Technology" },
  { title: "Area 51 Signals", date: "05.18.2026", category: "Government Files" },
  { title: "Ancient Signals", date: "05.15.2026", category: "Ancient Artifacts" },
  { title: "Genesis Protocol", date: "05.12.2026", category: "Genesis Records" },
  { title: "First Contact", date: "05.10.2026", category: "Communications" },
];

export const pageImages = {
  home: "/images/home-reference.png",
  mission: "/images/mission-control-reference.png",
  genesis: "/images/genesis-reference.png",
  lienity: "/images/lienity-reference.png",
  archive: "/images/archive-reference.png",
};

export const securityChecklist = [
  "Secrets are read only server-side and excluded from client bundles.",
  "API inputs are validated with Zod.",
  "Portrait uploads require JPG, PNG, or WEBP, 8 MB maximum, with magic-byte MIME verification.",
  "Mutation routes enforce same-origin checks.",
  "Transform, LIEN save, and admin authentication routes are rate-limited.",
  "Admin uses an httpOnly secure expiring session cookie.",
  "Supabase schema enables RLS and blocks public record enumeration.",
  "Structured logs redact secret names, portrait bytes, and private data.",
];

export const systemIcons = {
  Sparkles,
  BrainCircuit,
  Satellite,
  FileSearch,
  Archive,
  Building2,
};
