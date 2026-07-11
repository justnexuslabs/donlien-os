import {
  ArrowUpRight,
  CircleDotDashed,
  Cpu,
  Diamond,
  Layers3,
  LockKeyhole,
  Network,
  Orbit,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

const modules = [
  {
    icon: Network,
    title: "Lieniverse",
    copy: "A persistent world layer for drops, identity, lore, access, and community motion.",
  },
  {
    icon: WalletCards,
    title: "Genesis Protocol",
    copy: "Collection infrastructure for releases that need story, scarcity, metadata, and proof.",
  },
  {
    icon: ShieldCheck,
    title: "Trust Mesh",
    copy: "Signals for provenance, ownership, role permissions, and authenticated experiences.",
  },
  {
    icon: Cpu,
    title: "Operator Console",
    copy: "A command surface for publishing, coordinating, and evolving DonLien systems.",
  },
];

const phases = ["Signal", "Mint", "Activate", "Evolve"];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="DonLien OS home">
          <span className="brand-mark">
            <Diamond size={18} strokeWidth={2.6} />
          </span>
          <span>DonLien OS</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#protocol">Protocol</a>
          <a href="#modules">Modules</a>
          <a href="#roadmap">Roadmap</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-art" aria-hidden="true">
          <div className="grid-plane" />
          <div className="core-ring ring-one" />
          <div className="core-ring ring-two" />
          <div className="core-ring ring-three" />
          <div className="sigil">
            <Orbit size={74} strokeWidth={1.2} />
            <span>DL</span>
          </div>
          <div className="node node-a" />
          <div className="node node-b" />
          <div className="node node-c" />
          <div className="node node-d" />
        </div>

        <div className="hero-copy">
          <p className="eyebrow">Main branch online</p>
          <h1>DonLien OS</h1>
          <p className="lede">
            The operating layer for DonLien worlds, Genesis releases, identity
            gates, and the systems that hold the Lieniverse together.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#protocol">
              <Sparkles size={18} />
              Enter Protocol
            </a>
            <a className="button secondary" href="#modules">
              <ArrowUpRight size={18} />
              View Modules
            </a>
          </div>
        </div>
      </section>

      <section className="protocol" id="protocol">
        <div className="section-heading">
          <p className="eyebrow">Genesis stack</p>
          <h2>Built as a living command system.</h2>
        </div>
        <div className="protocol-console">
          <div className="console-top">
            <span />
            <span />
            <span />
          </div>
          <div className="console-body">
            <p>
              <span>system.boot</span> DonLien OS initialized on main
            </p>
            <p>
              <span>world.load</span> LIENIVERSE nodes synchronized
            </p>
            <p>
              <span>genesis.prepare</span> collection pipeline armed
            </p>
            <p>
              <span>access.map</span> identity gates and roles detected
            </p>
          </div>
        </div>
      </section>

      <section className="modules" id="modules">
        <div className="section-heading">
          <p className="eyebrow">Core modules</p>
          <h2>Four surfaces, one world layer.</h2>
        </div>
        <div className="module-grid">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <article className="module-card" key={module.title}>
                <Icon size={26} strokeWidth={1.8} />
                <h3>{module.title}</h3>
                <p>{module.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="roadmap" id="roadmap">
        <div className="section-heading">
          <p className="eyebrow">Release rhythm</p>
          <h2>From signal to evolving world.</h2>
        </div>
        <div className="phase-row">
          {phases.map((phase, index) => (
            <div className="phase" key={phase}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{phase}</strong>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <div>
          <CircleDotDashed size={20} />
          <span>DonLien OS</span>
        </div>
        <a href="https://github.com/justnexuslabs/donlien-os">
          justnexuslabs/donlien-os
        </a>
      </footer>
    </main>
  );
}
