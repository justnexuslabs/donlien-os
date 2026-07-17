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
  home: "/images/hero-final.jpg",
  mission: "/images/mission-control-final.jpg",
  genesis: "/images/genesis-final.jpg",
  lienity: "/images/lienity-final.jpg",
  archive: "/images/archive-final.jpg",
};

export const donLienDecks = {
  home: {
    eyebrow: "See DonLien",
    title: "The Signal Behind The LIENIVERSE",
    image: pageImages.home,
    slides: [
      {
        title: "DonLien Arrives",
        copy: "DonLien is the face of the LIENIVERSE: a public symbol for unity, technology, and a stranger future built in the open.",
      },
      {
        title: "DEN Connection",
        copy: "The DEN is the network layer behind the myth. It represents decentralized infrastructure, identity, and the tools that move the mission forward.",
      },
      {
        title: "Public Mission",
        copy: "The story is simple enough to share: every new LIEN joins a civilization-scale movement where art, AI, lore, and community all connect.",
      },
    ],
  },
  become: {
    eyebrow: "Meet The Intake Guide",
    title: "Your First DonLien Contact",
    image: pageImages.home,
    slides: [
      {
        title: "Upload",
        copy: "Start with a portrait. The system reads the human signal and prepares it for LIEN transformation without exposing private records publicly.",
      },
      {
        title: "Transform",
        copy: "The generation flow turns the uploaded portrait into a premium pixel DonLien identity with a role, name, and Level 51 status.",
      },
      {
        title: "Activate",
        copy: "After review, the identity can be saved, tracked in admin, and used later for Genesis drops, allowlists, and community records.",
      },
    ],
  },
  mission: {
    eyebrow: "Command View",
    title: "DonLien In Mission Control",
    image: pageImages.mission,
    slides: [
      {
        title: "Operational Layer",
        copy: "Mission Control is the dashboard side of the LIENIVERSE: systems, feeds, goals, and the command language of the project.",
      },
      {
        title: "Global Signal",
        copy: "The page frames DonLien as a strategist watching network activity, world nodes, UAP signals, and future infrastructure.",
      },
      {
        title: "Build Direction",
        copy: "This is where the brand can grow into tools, analytics, launch controls, and public status updates for future drops.",
      },
    ],
  },
  genesis: {
    eyebrow: "Genesis Protocol",
    title: "The First DonLien Relics",
    image: pageImages.genesis,
    slides: [
      {
        title: "Founding Supply",
        copy: "Genesis is the rarest layer: the first 300 LIENs, designed as the origin set and future badge of early belief.",
      },
      {
        title: "Badge Logic",
        copy: "The gold alien mark works best here as a seal: more official, more scarce, and separate from the everyday public logo.",
      },
      {
        title: "Drop Utility",
        copy: "This section can later carry mint windows, eligibility, allowlist proof, rarity details, and claim status without crowding the hero.",
      },
    ],
  },
  lienity: {
    eyebrow: "LIENITY",
    title: "DonLien As Diplomat",
    image: pageImages.lienity,
    slides: [
      {
        title: "Unity Layer",
        copy: "LIENITY is the social promise: different species, builders, creators, and regions moving under one shared banner.",
      },
      {
        title: "Embassy Energy",
        copy: "The brighter image style fits this page because LIENITY should feel open, civic, and welcoming instead of locked away.",
      },
      {
        title: "Community Shape",
        copy: "As the site matures, this section can hold member stories, city nodes, culture drops, and creator-led missions.",
      },
    ],
  },
  archive: {
    eyebrow: "Archive Level 51",
    title: "DonLien In The Records",
    image: pageImages.archive,
    slides: [
      {
        title: "Recovered Files",
        copy: "The Archive is the lore vault: old reports, strange signals, recovered technology, and the classified backbone of the world.",
      },
      {
        title: "Readable Lore",
        copy: "Longer story files belong in swipeable panels here, so visitors can move through the record without staring at one giant wall of text.",
      },
      {
        title: "Future Drops",
        copy: "Each later drop can unlock new entries, new evidence, and new DonLien context while keeping the visual page clean.",
      },
    ],
  },
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
