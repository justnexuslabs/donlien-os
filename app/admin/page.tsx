import { AdminPanel } from "@/components/AdminPanel";
import { DonLienStoryDeck } from "@/components/DonLienStoryDeck";
import { PageFrame } from "@/components/PageFrame";
import { hasAdminSession } from "@/lib/security";
import { donLienDecks, pageImages } from "@/lib/content";

export default async function AdminPage() {
  const active = await hasAdminSession();
  return (
    <PageFrame image={pageImages.mission} accent="#35ECFF">
      <AdminPanel active={active} />
      <DonLienStoryDeck {...donLienDecks.mission} accent="#35ECFF" />
    </PageFrame>
  );
}
