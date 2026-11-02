import { LegalDocPage } from "@/components/legal/LegalDocPage";
import { JsonLd } from "@/components/seo/StructuredData";
import { privacy } from "@/content/legal/privacy";
import { pageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const PATH = "/privacy-policy";
const TITLE = "Privacy Policy";
const DESCRIPTION =
  "How Sysora Stack collects, uses, shares and protects personal information, including the data we process inside our customers’ systems.";

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function PrivacyPolicyPage() {
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
      <LegalDocPage doc={privacy} crumb={{ name: TITLE, path: PATH }} />
    </>
  );
}
