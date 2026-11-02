import { LegalDocPage } from "@/components/legal/LegalDocPage";
import { JsonLd } from "@/components/seo/StructuredData";
import { terms } from "@/content/legal/terms";
import { pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const PATH = "/terms";
const TITLE = "Terms and Conditions";
const DESCRIPTION =
  "The terms for prepaid Sysora Stack hours: the published rate table, validity and reset, the unused-hours refund guarantee, and what is not included.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function TermsPage() {
  return (
    <>
      <JsonLd
        graph={pageGraph({
          path: PATH,
          name: `${TITLE} | Sysora Stack`,
          description: DESCRIPTION,
          crumbs: [{ name: TITLE, path: PATH }],
        })}
      />
      <LegalDocPage doc={terms} crumb={{ name: TITLE, path: PATH }} />
    </>
  );
}
