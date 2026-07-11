import { AdminPanel } from "@/components/AdminPanel";
import { PageFrame } from "@/components/PageFrame";
import { hasAdminSession } from "@/lib/security";
import { pageImages } from "@/lib/content";

export default async function AdminPage() {
  const active = await hasAdminSession();
  return (
    <PageFrame image={pageImages.mission} accent="#35ECFF">
      <AdminPanel active={active} />
    </PageFrame>
  );
}
