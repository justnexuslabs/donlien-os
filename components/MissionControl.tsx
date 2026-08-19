"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, Award, CircleUserRound, Gamepad2, Gift, Home, LockKeyhole, RefreshCw, Rocket, ShieldCheck, Target, Trophy } from "lucide-react";
import type { LienProfile } from "@/lib/lien-session";
import type { MissionControlGame } from "@/lib/mission-control-config";
import { achievementDefinitions, missionsFor, seasonTrack, type MissionControlSnapshot } from "@/lib/mission-control";

type Tab = "home" | "play" | "missions" | "progress" | "archive" | "rewards" | "profile";
type Props = { initialProfile: LienProfile; games: MissionControlGame[] };

const tabs = [
  ["home", "Home", Home], ["play", "Play", Gamepad2], ["missions", "Missions", Target],
  ["progress", "Progress", Trophy], ["archive", "Archive", Archive],
  ["rewards", "Rewards", Gift], ["profile", "Profile", CircleUserRound],
] as const;

function xpRange(level: number) {
  const current = Math.max(1, level);
  return { previous: current <= 1 ? 0 : 100 * (current - 1) ** 2, next: 100 * current ** 2 };
}

function sendEvent(event: string) {
  const key = "donlien_generation_session";
  const sessionId = localStorage.getItem(key) || crypto.randomUUID();
  localStorage.setItem(key, sessionId);
  void fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event, sessionId }) });
}

export function MissionControl({ initialProfile, games }: Props) {
  const [profile, setProfile] = useState(initialProfile);
  const [tab, setTab] = useState<Tab>("home");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(() => new Date());
  const [snapshot, setSnapshot] = useState<MissionControlSnapshot>({ rank: null, transactions: [] });
  const range = useMemo(() => xpRange(profile.level), [profile.level]);
  const xpProgress = Math.max(0, Math.min(100, ((profile.xp - range.previous) / Math.max(1, range.next - range.previous)) * 100));

  const refresh = useCallback(async () => {
    setRefreshing(true); setError("");
    try {
      const response = await fetch("/api/lien/profile", { cache: "no-store" });
      const body = await response.json().catch(() => null) as { profile?: LienProfile; missionControl?: MissionControlSnapshot; error?: string } | null;
      if (!response.ok || !body?.profile) throw new Error(body?.error || "Progression could not be loaded");
      setProfile(body.profile); setSnapshot(body.missionControl || { rank: null, transactions: [] }); setUpdatedAt(new Date());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Progression could not be loaded");
    } finally { setRefreshing(false); }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  function selectTab(next: Tab) {
    setTab(next);
    const event: Partial<Record<Tab, string>> = { play: "game_launcher_opened", missions: "mission_viewed", progress: "progress_viewed", archive: "archive_viewed", rewards: "reward_viewed" };
    if (event[next]) sendEvent(event[next]!);
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-32 md:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="section-kicker">Authenticated LIEN headquarters</p><h1 className="font-display text-4xl font-black uppercase md:text-6xl">Mission Control</h1><p className="mt-2 text-cyan-100">One identity. Every game. Every season.</p></div>
        <button onClick={refresh} disabled={refreshing} className="secondary-cta"><RefreshCw className={refreshing ? "animate-spin" : ""} size={18}/>{refreshing ? "Syncing" : "Refresh Progress"}</button>
      </header>

      {error ? <div className="mb-5 border border-amber-300/60 bg-amber-950/70 p-4"><p className="font-display font-black uppercase text-amber-200">Signal interrupted</p><p className="text-sm text-zinc-200">{error}. Your last verified profile remains visible.</p><button className="mt-3 text-sm font-black uppercase text-cyan-200 underline" onClick={refresh}>Try again</button></div> : null}

      <section className="mc-identity-grid">
        <div className="mc-panel mc-profile-summary">
          <div className="flex items-center gap-4">
            <div className="relative size-20 overflow-hidden rounded-full border border-cyan-300/60 bg-black">
              {profile.avatarUrl ? <Image src={profile.avatarUrl} alt={`${profile.lienName} LIEN portrait`} fill unoptimized className="object-cover"/> : <CircleUserRound className="m-5 text-cyan-200"/>}
            </div>
            <div><p className="text-xs uppercase tracking-[.2em] text-lime-300">Welcome back</p><h2 className="font-display text-3xl font-black uppercase">{profile.lienName}</h2><p className="uppercase text-cyan-100">{profile.role} · Level {profile.level}</p><p className="font-mono text-sm text-zinc-300">{profile.lienId}</p></div>
          </div>
          <div className="mt-6"><div className="mb-2 flex justify-between text-xs uppercase"><span>XP progression</span><span>{profile.xp.toLocaleString()} / {range.next.toLocaleString()}</span></div><div className="h-3 overflow-hidden bg-white/10"><div className="h-full bg-gradient-to-r from-lime-400 to-cyan-300" style={{width:`${xpProgress}%`}}/></div></div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="GLB" value={profile.glb.toLocaleString()}/><Metric label="Season" value={profile.seasonId}/><Metric label="Rank" value={snapshot.rank?`#${snapshot.rank}`:"Unranked"}/><Metric label="Streak" value={`${profile.streak || 0} days`}/></div>
        </div>
        <div className="mc-panel mc-card-preview">
          <div className="relative aspect-[5/3] overflow-hidden border border-cyan-300/40 bg-black/70">
            {profile.avatarUrl ? <Image src={profile.avatarUrl} alt="Current LIEN card portrait" fill unoptimized className="object-cover opacity-75"/> : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-cyan-950/40"/><div className="absolute inset-x-4 bottom-4"><p className="font-display text-xl font-black uppercase">Current {profile.seasonId} Card</p><p className="text-xs uppercase text-cyan-200">{profile.seasonName} · {profile.cardEdition} · {profile.cardStatus}</p></div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2"><Link href="/lien-id#live-card" className="secondary-cta justify-center" onClick={()=>sendEvent("card_viewed")}>View Card</Link><button onClick={()=>selectTab("archive")} className="secondary-cta justify-center">Archive</button></div>
        </div>
      </section>

      <nav className="mc-tabs" aria-label="Mission Control sections">
        {tabs.map(([id,label,Icon])=><button key={id} onClick={()=>selectTab(id)} aria-current={tab===id?"page":undefined} className={tab===id?"is-active":""}><Icon size={17}/><span>{label}</span></button>)}
      </nav>

      <main className="mt-5">
        {tab === "home" && <HomePanel profile={profile} games={games} onPlay={()=>selectTab("play")} onArchive={()=>selectTab("archive")} onMissions={()=>selectTab("missions")}/>} 
        {tab === "play" && <PlayPanel games={games}/>} 
        {tab === "missions" && <MissionsPanel profile={profile}/>} 
        {tab === "progress" && <ProgressPanel profile={profile} nextXp={range.next} progress={xpProgress}/>} 
        {tab === "archive" && <ArchivePanel profile={profile}/>} 
        {tab === "rewards" && <RewardsPanel profile={profile} snapshot={snapshot}/>} 
        {tab === "profile" && <ProfilePanel profile={profile}/>} 
      </main>
      <p className="mt-4 text-right text-xs uppercase tracking-wider text-zinc-500">Last verified sync {updatedAt.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</p>
    </div>
  );
}

function Metric({label,value}:{label:string;value:string}) { return <div className="border-l-2 border-lime-300/70 bg-white/[.04] p-3"><p className="text-[10px] uppercase tracking-widest text-zinc-400">{label}</p><p className="font-display text-lg font-black uppercase text-white">{value}</p></div>; }

function HomePanel({profile,games,onPlay,onArchive,onMissions}:{profile:LienProfile;games:MissionControlGame[];onPlay:()=>void;onArchive:()=>void;onMissions:()=>void}) {
  const missions=missionsFor(profile); const done=missions.filter(m=>m.status==="completed").length;
  return <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><section className="mc-panel"><p className="section-kicker">Operational overview</p><h2 className="font-display text-3xl font-black uppercase">Your LIEN signal is active</h2><div className="mt-5 grid gap-3 sm:grid-cols-3"><Metric label="Season points" value={profile.seasonPoints.toLocaleString()}/><Metric label="Achievements" value={profile.achievements.length.toString()}/><Metric label="Games online" value={games.filter(game=>game.enabled).length.toString()}/></div><div className="mt-6 flex flex-wrap gap-3"><button className="primary-cta" onClick={onPlay}><Rocket size={18}/>Launch a Game</button><button className="secondary-cta" onClick={onArchive}><Archive size={18}/>View History</button></div></section><section className="mc-panel"><Target className="text-cyan-200"/><h2 className="font-display mt-3 text-2xl font-black uppercase">Mission board</h2><p className="mt-2 text-zinc-300">{done} / {missions.length} verified objectives complete</p><div className="mt-4 h-3 bg-white/10"><div className="h-full bg-lime-300" style={{width:`${(done/missions.length)*100}%`}}/></div><button className="secondary-cta mt-5" onClick={onMissions}>View missions</button></section></div>;
}

function MissionsPanel({profile}:{profile:LienProfile}) { const missions=missionsFor(profile); return <section><p className="section-kicker">Verified objectives</p><h2 className="section-title">Missions</h2><p className="mt-2 max-w-3xl text-sm text-zinc-300">Progress comes only from verified game events. Mission Control cannot grant itself GLB or XP.</p><div className="mt-6 grid gap-4 md:grid-cols-2">{missions.map(mission=><article className="mc-panel" key={mission.id}><div className="flex items-center justify-between gap-3"><h3 className="font-display text-2xl font-black uppercase">{mission.title}</h3><span className={`text-xs font-black uppercase ${mission.status==="completed"?"text-lime-300":"text-cyan-200"}`}>{mission.status}</span></div><p className="mt-2 text-zinc-300">{mission.description}</p><div className="mt-5 h-3 bg-white/10"><div className="h-full bg-gradient-to-r from-lime-400 to-cyan-300" style={{width:`${Math.min(100,(mission.progress/mission.target)*100)}%`}}/></div><div className="mt-2 flex justify-between text-xs uppercase text-zinc-400"><span>{mission.progress} / {mission.target}</span><span>{mission.rewardLabel}</span></div></article>)}</div></section>; }

function PlayPanel({games}:{games:MissionControlGame[]}) { return <section><p className="section-kicker">Game network</p><h2 className="section-title">Play</h2><div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{games.map(game=><article className="mc-game-card" key={game.gameId}><div className="relative h-40 overflow-hidden"><Image src={game.image} alt="" fill className="object-cover opacity-55"/><div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"/><span className="absolute right-3 top-3 border border-cyan-300/50 bg-black/80 px-2 py-1 text-xs font-black text-cyan-200">{game.status}</span></div><div className="p-5"><h3 className="font-display text-2xl font-black uppercase">{game.name}</h3><p className="mt-2 min-h-12 text-sm text-zinc-300">{game.description}</p>{game.note?<p className="mt-3 text-xs uppercase text-amber-200">{game.note}</p>:null}{game.enabled&&game.route?<Link href={game.route} target={game.external?"_blank":undefined} rel={game.external?"noreferrer":undefined} className="primary-cta mt-5 justify-center" onClick={()=>sendEvent("game_started")}><Gamepad2 size={18}/>Play</Link>:<button disabled className="secondary-cta mt-5 w-full justify-center opacity-50"><LockKeyhole size={18}/>Locked</button>}</div></article>)}</div></section>; }

function ProgressPanel({profile,nextXp,progress}:{profile:LienProfile;nextXp:number;progress:number}) { return <div className="grid gap-5 md:grid-cols-2"><section className="mc-panel"><p className="section-kicker">Season progression</p><h2 className="font-display text-3xl font-black uppercase">{profile.seasonId} · {profile.seasonName}</h2><p className="mt-5 text-5xl font-black text-lime-300">LEVEL {profile.level}</p><div className="mt-5 h-4 bg-white/10"><div className="h-full bg-gradient-to-r from-lime-400 to-cyan-300" style={{width:`${progress}%`}}/></div><p className="mt-2 text-sm text-zinc-300">{profile.xp.toLocaleString()} / {nextXp.toLocaleString()} XP</p><div className="mt-6 grid gap-2">{seasonTrack.map(item=><div className="flex justify-between border-b border-white/10 py-3" key={item.level}><span className="font-display font-black uppercase">Level {item.level} · {item.label}</span><span className={profile.level>=item.level?"text-lime-300":"text-zinc-500"}>{profile.level>=item.level?"Reached":item.status}</span></div>)}</div></section><section className="mc-panel"><p className="section-kicker">Verified activity</p><div className="mt-4 grid gap-3"><Metric label="Available GLB" value={profile.glb.toLocaleString()}/><Metric label="Lifetime points" value={profile.lifetimePoints.toLocaleString()}/><Metric label="Season points" value={profile.seasonPoints.toLocaleString()}/><Metric label="Streak" value={`${profile.streak || 0} days`}/></div><h3 className="font-display mt-7 text-xl font-black uppercase">Achievements</h3><div className="mt-3 grid gap-2">{profile.achievements.length?profile.achievements.map(id=><div className="border border-cyan-300/20 bg-black/30 p-3" key={id}><strong className="uppercase text-cyan-100">{achievementDefinitions[id]?.name || id.replaceAll("-"," ")}</strong><p className="text-xs text-zinc-400">{achievementDefinitions[id]?.description || "Verified LIENIVERSE achievement"}</p></div>):<p className="text-sm text-zinc-400">Complete verified game objectives to unlock achievements.</p>}</div></section></div>; }

function ArchivePanel({profile}:{profile:LienProfile}) { const history=profile.cardHistory||[]; return <section><p className="section-kicker">Permanent identity history</p><h2 className="section-title">LIEN Archive</h2>{history.length?<div className="mt-6 grid gap-4 md:grid-cols-2">{history.map((card,index)=><article className="mc-panel" key={`${card.seasonId}-${card.issuedAt}-${index}`}><p className="text-xs uppercase text-cyan-200">{card.retiredAt?"Retired card":"Seasonal card"}</p><h3 className="font-display mt-2 text-2xl font-black uppercase">{card.seasonId} · {card.seasonName}</h3><p className="mt-3 uppercase text-zinc-300">{card.edition} edition</p><p className="text-zinc-300">{card.seasonPoints.toLocaleString()} season points</p><p className="mt-3 text-xs text-zinc-500">Issued {new Date(card.issuedAt).toLocaleDateString()}</p></article>)}</div>:<div className="mc-panel mt-6"><Archive className="text-cyan-200"/><h3 className="font-display mt-3 text-2xl font-black uppercase">No retired cards yet</h3><p className="text-zinc-300">Your current seasonal card will remain in history when a future season retires it.</p></div>}</section>; }

function RewardsPanel({profile,snapshot}:{profile:LienProfile;snapshot:MissionControlSnapshot}) { return <div className="grid gap-5 md:grid-cols-2"><section className="mc-panel"><p className="section-kicker">Available balance</p><p className="mt-3 text-6xl font-black text-lime-300">{profile.glb.toLocaleString()} GLB</p><p className="mt-3 text-zinc-300">Server-authoritative Galactic Lien Bucks.</p><h3 className="font-display mt-7 text-xl font-black uppercase">Recent activity</h3><div className="mt-3 grid gap-2">{snapshot.transactions.length?snapshot.transactions.map(tx=><div className="flex items-center justify-between border-b border-white/10 py-3" key={tx.id}><div><strong className={tx.amount>=0?"text-lime-300":"text-amber-200"}>{tx.amount>=0?"+":""}{tx.amount} GLB</strong><p className="text-xs uppercase text-zinc-400">{tx.reason.replaceAll("_"," ")}</p></div><time className="text-xs text-zinc-500">{new Date(tx.createdAt).toLocaleDateString()}</time></div>):<p className="text-sm text-zinc-400">No GLB transactions are available yet.</p>}</div></section><UnavailablePanel icon={Gift} title="GLB cosmetic store" copy="Coming soon. No fake products or browser-side purchases are enabled; fulfillment must be server-authoritative before this opens."/></div>; }

function ProfilePanel({profile}:{profile:LienProfile}) { return <section className="mc-panel"><p className="section-kicker">Permanent account</p><h2 className="font-display text-3xl font-black uppercase">Profile</h2><dl className="mt-6 grid gap-4 md:grid-cols-2">{[["LIEN designation",profile.lienName],["Permanent LIEN ID",profile.lienId],["Telegram","Connected"],["Role",profile.role],["Edition",profile.cardEdition],["Season",`${profile.seasonId} · ${profile.seasonName}`],["Card status",profile.cardStatus],["Card issued",profile.cardIssuedAt?new Date(profile.cardIssuedAt).toLocaleDateString():"Unavailable"]].map(([label,value])=><div className="border-b border-white/10 pb-3" key={label}><dt className="text-xs uppercase tracking-widest text-zinc-500">{label}</dt><dd className="mt-1 font-display text-lg font-black uppercase">{value}</dd></div>)}</dl>{profile.role==="DEN Guardian"?<p className="mt-6 flex items-center gap-2 text-sm uppercase text-amber-200"><ShieldCheck size={18}/>Administrator-appointed trust designation</p>:null}</section>; }

function UnavailablePanel({icon:Icon,title,copy}:{icon:typeof Award;title:string;copy:string}) { return <section className="mc-panel"><Icon className="text-cyan-200"/><h2 className="font-display mt-3 text-2xl font-black uppercase">{title}</h2><p className="mt-2 text-sm leading-6 text-zinc-300">{copy}</p></section>; }
