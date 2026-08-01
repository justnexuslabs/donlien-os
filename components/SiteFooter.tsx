import Link from "next/link";

const links = [
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
  ["Refunds", "/refund-policy"],
  ["AI Image Consent", "/ai-image-consent"],
  ["Community Guidelines", "/community-guidelines"],
  ["Support & Deletion", "/support"],
] as const;

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-lime-400/20 bg-black/90 px-4 py-8 md:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="font-display font-black uppercase text-lime-200">DONLIEN.XYZ · Season One Early Access</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Payment completed but your LIEN ID has not appeared? Contact support with your
            Telegram username and Stripe receipt. Do not submit a second payment.
          </p>
        </div>
        <nav className="flex max-w-2xl flex-wrap gap-x-5 gap-y-3 text-sm" aria-label="Legal and support">
          {links.map(([label, href]) => <Link className="text-zinc-300 hover:text-lime-200" href={href} key={href}>{label}</Link>)}
        </nav>
      </div>
    </footer>
  );
}
