import Link from "next/link";
import { HudPanel } from "@/components/HudPanel";
import { PageFrame } from "@/components/PageFrame";
import { pageImages } from "@/lib/content";

type Verification = {
  valid: boolean;
  credential?: {
    lienId: string;
    lienName: string;
    role: string;
    avatarUrl: string;
    seasonId: string;
    seasonName: string;
    seasonPoints: number;
    lifetimePoints: number;
    edition: string;
    status: string;
    issuedAt: string;
  };
};

export default async function VerifyPage({ params }: { params: Promise<{ lienId: string }> }) {
  const { lienId } = await params;
  const response = await fetch(
    `https://lien-ascension.netlify.app/api/verify?lienId=${encodeURIComponent(lienId)}`,
    { cache: "no-store" },
  );
  const result = (await response.json()) as Verification;
  const card = result.credential;

  return (
    <PageFrame image={pageImages.lienity} accent="#35ECFF">
      <section className="mx-auto min-h-[calc(100svh-6rem)] max-w-3xl px-4 py-16 md:px-8">
        <HudPanel title={result.valid ? "Official LIEN-ID Verified" : "Unverified LIEN-ID"} accent={result.valid ? "#35ECFF" : "#ff5555"}>
          {card ? (
            <div className="grid gap-6 sm:grid-cols-[12rem_1fr]">
              {card.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.avatarUrl} alt="" className="aspect-square w-full border border-cyan-300/60 object-cover [image-rendering:pixelated]" />
              ) : null}
              <div>
                <p className="font-display text-3xl font-black uppercase text-cyan-200">{card.lienName}</p>
                <p className="mt-1 break-all font-display text-lime-300">{card.lienId}</p>
                <p className="mt-4 uppercase">{card.role} · {card.edition} edition</p>
                <p>{card.seasonId} · {card.seasonName} · {card.status}</p>
                <p className="mt-4">{card.seasonPoints.toLocaleString()} season points</p>
                <p>{card.lifetimePoints.toLocaleString()} lifetime points</p>
              </div>
            </div>
          ) : (
            <p>This card does not resolve to the official LIEN registry. Do not accept it as authentic.</p>
          )}
          <Link href="/lien-id" className="mt-6 inline-block border border-lime-300 px-5 py-3 font-display uppercase text-lime-200">
            Open LIEN ID
          </Link>
        </HudPanel>
      </section>
    </PageFrame>
  );
}
