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

// Keep legacy roles readable so archived cards never change. Only seasonOneRoles are selectable now.
export const roles = ["Builder", "Strategist", "Diplomat", "Creator", "Explorer", "Guardian"] as const;
export const seasonOneRoles = ["Guardian", "Strategist", "Builder", "Creator"] as const;

export const seasonOneRoleVersion = "s01.v1" as const;

export const roleProfiles = {
  Builder: {
    id: "builder",
    version: seasonOneRoleVersion,
    title: "Builder · Architect of Possibility",
    purpose: "Turns ambitious ideas into useful systems, tools, communities, and lasting foundations.",
    charge: "Build what helps others rise. Leave every system stronger than you found it.",
    traits: ["Practical", "Inventive", "Persistent"],
    insignia: "Interlocking orbital frame",
    palette: "electric cyan, construction amber, and alien green",
    emblemGlyph: "◇",
    outfitDirection: "modular utility exosuit and engineering harness",
    backgroundTheme: "luminous orbital construction bay and digital blueprint grid",
    signatureEffect: "digital construction grid assembling behind the shoulders",
    poseDirection: "confident, practical, hands-ready engineering stance",
    visualPrompt:
      "Depict a LIEN systems architect in a structured utility exosuit with modular tool interfaces, luminous blueprint lines, and an interlocking orbital-frame insignia. Use a confident hands-ready pose inside a futuristic construction bay. The silhouette must communicate engineering, invention, and dependable creation.",
  },
  Strategist: {
    id: "strategist",
    version: seasonOneRoleVersion,
    title: "Strategist · Navigator of Outcomes",
    purpose: "Sees patterns, anticipates consequences, and coordinates people toward a shared victory.",
    charge: "Think beyond the next move. Use foresight in service of the whole LIENIVERSE.",
    traits: ["Analytical", "Decisive", "Far-seeing"],
    insignia: "Three-point signal compass",
    palette: "deep violet, tactical cyan, and alien green",
    emblemGlyph: "△",
    outfitDirection: "refined tactical command coat with structured high collar",
    backgroundTheme: "orbital command chamber with a controlled holographic map",
    signatureEffect: "three-point tactical map and precise data vectors",
    poseDirection: "focused, composed, observant command posture",
    visualPrompt:
      "Depict a LIEN mission strategist in a refined command coat with a three-point signal-compass insignia, layered holographic tactical maps, and subtle data-grid details. Use a composed observant pose in an orbital command chamber. The silhouette must communicate foresight, coordination, and calm authority.",
  },
  Diplomat: {
    id: "diplomat",
    version: "legacy.v1",
    title: "Diplomat · Bridge Between Worlds",
    purpose: "Creates trust across cultures, resolves conflict, and protects dignity in every exchange.",
    charge: "Listen before leading. Turn difference into understanding and understanding into unity.",
    traits: ["Empathetic", "Eloquent", "Unifying"],
    insignia: "Twin worlds joined by a signal arc",
    palette: "luminous teal, diplomatic gold, and alien green",
    emblemGlyph: "∞",
    outfitDirection: "elegant ceremonial interworld uniform",
    backgroundTheme: "luminous embassy atrium",
    signatureEffect: "connected signal nodes",
    poseDirection: "open, balanced, welcoming pose",
    visualPrompt:
      "Depict a LIEN interworld envoy in an elegant ceremonial suit with a twin-world signal-arc insignia, balanced symmetrical tailoring, and subtle universal-language glyphs. Use an open welcoming pose in a luminous embassy atrium. The silhouette must communicate empathy, trust, unity, and dignified influence.",
  },
  Creator: {
    id: "creator",
    version: seasonOneRoleVersion,
    title: "Creator · Keeper of Culture",
    purpose: "Transforms imagination into art, stories, experiences, and symbols that move the community.",
    charge: "Make the unseen visible. Create work that gives the LIENIVERSE a soul.",
    traits: ["Expressive", "Original", "Visionary"],
    insignia: "Radiant prism spark",
    palette: "neon magenta, prismatic cyan, and alien green",
    emblemGlyph: "✦",
    outfitDirection: "expressive iridescent studio jacket with creative-tech accessories",
    backgroundTheme: "future media atelier with a restrained prismatic data field",
    signatureEffect: "colorful pixel data particles and a radiant prism spark",
    poseDirection: "expressive, self-possessed, imaginative portrait stance",
    visualPrompt:
      "Depict a LIEN culture-maker in an iridescent studio jacket with a radiant prism-spark insignia, controlled creative energy trails, and pixel-art production tools. Use an expressive poised stance in a future media atelier. The silhouette must communicate originality, storytelling, artistic confidence, and cultural vision.",
  },
  Explorer: {
    id: "explorer",
    version: "legacy.v1",
    title: "Explorer · Seeker Beyond the Signal",
    purpose: "Ventures into unknown territory, gathers knowledge, and expands the map for everyone behind them.",
    charge: "Meet the unknown with courage and curiosity. Return with knowledge the community can use.",
    traits: ["Curious", "Adaptive", "Courageous"],
    insignia: "Rising star over an open horizon",
    palette: "stellar blue, expedition silver, and alien green",
    emblemGlyph: "✧",
    outfitDirection: "sleek deep-signal expedition suit",
    backgroundTheme: "alien horizon with planetary scanner",
    signatureEffect: "planetary scan arc",
    poseDirection: "ready, forward-looking expedition pose",
    visualPrompt:
      "Depict a LIEN deep-signal explorer in a sleek expedition suit with a rising-star horizon insignia, compact navigation instruments, and layered star-chart details. Use a ready forward-looking pose at the threshold of an alien landscape or portal. The silhouette must communicate curiosity, adaptability, discovery, and brave movement.",
  },
  Guardian: {
    id: "guardian",
    version: seasonOneRoleVersion,
    title: "Guardian · Shield of LIENITY",
    purpose: "Protects people, knowledge, and shared spaces while holding power accountable.",
    charge: "Stand firm without losing compassion. Protect the future, not merely the gate.",
    traits: ["Loyal", "Disciplined", "Protective"],
    insignia: "Living shield around a central star",
    palette: "obsidian, protective gold, and alien green",
    emblemGlyph: "⬡",
    outfitDirection: "streamlined defensive ceremonial armor with protective geometry",
    backgroundTheme: "secure LIEN gateway framed by a restrained energy shield",
    signatureEffect: "living energy shield surrounding a central star",
    poseDirection: "grounded, strong, vigilant protective stance",
    visualPrompt:
      "Depict a LIEN protector in streamlined ceremonial armor with a living-shield star insignia, restrained energy barriers, and strong protective geometry. Use a grounded vigilant pose before a secure LIEN gateway. The silhouette must communicate stewardship, discipline, compassion, and formidable protection without aggression.",
  },
} satisfies Record<
  (typeof roles)[number],
  {
    title: string;
    id: string;
    version: string;
    purpose: string;
    charge: string;
    traits: readonly string[];
    insignia: string;
    palette: string;
    emblemGlyph: string;
    outfitDirection: string;
    backgroundTheme: string;
    signatureEffect: string;
    poseDirection: string;
    visualPrompt: string;
  }
>;

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
  { label: "Clearance Interface", value: "Demo", copy: "Concept display", icon: LockKeyhole },
  { label: "Active Missions", value: "Beta", copy: "First mission in development", icon: Radar },
  { label: "Threat Telemetry", value: "Offline", copy: "No live security feed", icon: Shield },
  { label: "Location", value: "Digital", copy: "No physical command center", icon: Globe2 },
];

export const objectives = [
  "Expand LIENITY",
  "Deploy AI infrastructure",
  "Secure the network",
  "Prepare for Genesis",
];

export const liveFeeds = [
  "Demo: UAP protocol",
  "Demo: satellite link",
  "Planned: systems feed",
  "Planned: network telemetry",
  "Planned: Genesis status",
  "Beta: LIENITY portal",
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
