"use client";

import { useEffect, useRef } from "react";

export function TelegramLienLogin() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    host.current.replaceChildren();
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", "LIENASCENSIONBOT");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-auth-url", `${window.location.origin}/api/lien/auth`);
    host.current.appendChild(script);
  }, []);
  return <div ref={host} className="min-h-12" aria-label="Connect LIEN ID with Telegram" />;
}
