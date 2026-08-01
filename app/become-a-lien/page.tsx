import { cookies } from "next/headers";
import { BecomeLienWizard } from "@/components/BecomeLienWizard";
import { PageFrame } from "@/components/PageFrame";
import { pageImages } from "@/lib/content";
import { readLienSession } from "@/lib/lien-session";
import { hasAdminSession, isPermanentLienAdmin } from "@/lib/security";

export default async function BecomeLienPage() {
  const profile = readLienSession((await cookies()).get("lien_session")?.value);
  const freeGeneration =
    (await hasAdminSession()) || isPermanentLienAdmin(profile?.lienId);
  return (
    <PageFrame image={pageImages.home}>
      <section className="mx-auto grid min-h-[45svh] max-w-6xl content-end gap-5 px-4 pb-10 pt-16 md:px-8">
        <div className="max-w-3xl">
          <p className="font-display text-lime-300">GET YOUR LIEN ID · GUIDED ACTIVATION</p>
          <h1 className="font-display text-5xl font-black uppercase md:text-7xl">Claim your living identity</h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-zinc-100">
            Connect Telegram, upload one clear photo, choose your name, role, and edition, then pay securely and generate your seasonal card.
          </p>
        </div>
      </section>
      <BecomeLienWizard
        freeGeneration={freeGeneration}
        permanentIdentity={profile}
      />
    </PageFrame>
  );
}
