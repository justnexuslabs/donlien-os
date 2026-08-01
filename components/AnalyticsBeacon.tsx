"use client";
import { useEffect } from "react";
export function AnalyticsBeacon({ event }: { event: string }) {
  useEffect(() => { const key="donlien_generation_session"; const sessionId=localStorage.getItem(key)||crypto.randomUUID(); localStorage.setItem(key,sessionId); void fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event,sessionId})}); },[event]);
  return null;
}
