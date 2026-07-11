import { BecomeLienWizard } from "@/components/BecomeLienWizard";
import { PageFrame } from "@/components/PageFrame";
import { pageImages } from "@/lib/content";

export default function BecomeLienPage() {
  return (
    <PageFrame image={pageImages.home}>
      <BecomeLienWizard />
    </PageFrame>
  );
}
