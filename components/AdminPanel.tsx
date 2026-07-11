"use client";

import { useState } from "react";
import { HudPanel } from "./HudPanel";

type AdminPanelProps = {
  active: boolean;
};

export function AdminPanel({ active }: AdminPanelProps) {
  const [accessCode, setAccessCode] = useState("");
  const [authed, setAuthed] = useState(active);
  const [status, setStatus] = useState("");
  const [records, setRecords] = useState<Array<Record<string, string>>>([]);

  async function login() {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessCode }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.error || "Access denied.");
      return;
    }
    setAuthed(true);
    setStatus("Admin session active.");
  }

  async function refresh() {
    const response = await fetch("/api/admin/liens", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.error || "Unable to load records.");
      return;
    }
    setRecords(payload.records || []);
    setStatus(`Loaded ${payload.records?.length || 0} records.`);
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-5 px-4 pb-10 md:px-8">
      <div className="text-center">
        <p className="font-display text-cyan-300">AUTHORIZED LIENS ONLY</p>
        <h1 className="font-display text-5xl font-black uppercase md:text-7xl">Admin Console</h1>
      </div>
      {!authed ? (
        <HudPanel title="Secure Authentication" accent="#35ECFF">
          <label className="grid gap-2">
            <span className="font-display uppercase">Admin access code</span>
            <input className="border border-cyan-300/30 bg-black/70 p-3" type="password" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} />
          </label>
          <button className="clip-hud mt-5 border border-cyan-300 px-5 py-3 font-display uppercase text-cyan-200" onClick={login}>
            Authenticate
          </button>
        </HudPanel>
      ) : (
        <HudPanel title="Newest Identities" accent="#35ECFF">
          <div className="mb-4 flex flex-wrap gap-3">
            <button className="clip-hud border border-cyan-300 px-5 py-3 font-display uppercase text-cyan-200" onClick={refresh}>Refresh</button>
            <span className="self-center text-sm text-zinc-300">Filters: role, status, and date are API-safe; full filtering activates with Supabase credentials.</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="font-display uppercase text-cyan-200">
                <tr><th className="p-2">Human</th><th className="p-2">LIEN</th><th className="p-2">Role</th><th className="p-2">Date</th><th className="p-2">Genesis</th></tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr className="border-t border-cyan-300/20" key={record.lien_id}>
                    <td className="p-2">{record.human_name}</td>
                    <td className="p-2">{record.lien_name}</td>
                    <td className="p-2">{record.role}</td>
                    <td className="p-2">{record.created_at}</td>
                    <td className="p-2">{record.genesis_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </HudPanel>
      )}
      {status ? <p className="hud-panel clip-hud p-4 text-sm text-cyan-100" aria-live="polite">{status}</p> : null}
    </section>
  );
}
