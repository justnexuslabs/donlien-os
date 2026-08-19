import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AnalyticsBeacon } from "@/components/AnalyticsBeacon";
import { MissionControl } from "@/components/MissionControl";
import { PageFrame } from "@/components/PageFrame";
import { pageImages } from "@/lib/content";
import { readLienSessionDetails } from "@/lib/lien-session";
import { missionControlGames } from "@/lib/mission-control-config";

export const dynamic = "force-dynamic";

export default async function MissionControlPage() {
  const session = readLienSessionDetails((await cookies()).get("lien_session")?.value);
  if (!session) redirect("/lien-id?next=/mission-control");

  return (
    <PageFrame image={pageImages.mission} accent="#35ECFF">
      <AnalyticsBeacon event="mission_control_opened" />
      <MissionControl initialProfile={session.profile} games={missionControlGames} />
    </PageFrame>
  );
}
