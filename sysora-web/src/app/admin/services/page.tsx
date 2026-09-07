import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeading } from "@/components/admin/ui";
import { NewServiceForm } from "@/components/admin/NewServiceForm";
import { ServiceEditor } from "@/components/admin/ServiceEditor";
import { canManagePricing, requirePipeline } from "@/lib/admin/auth";
import { getServiceFaqs, listAllServices } from "@/lib/sales/services";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesAdminPage() {
  const session = await requirePipeline();
  const canEdit = canManagePricing(session.role);

  const services = await listAllServices();
  // Few enough rows that fetching the questions per service is cheaper
  // than a join plus regrouping in JavaScript.
  const faqsByService = new Map(
    await Promise.all(
      services.map(async (s) => [s.id, await getServiceFaqs(s.id)] as const),
    ),
  );

  return (
    <AdminShell session={session}>
      <PageHeading eyebrow="What we sell" title="Services" />
      <p className="mt-[-16px] mb-8 max-w-[70ch] text-[14px] leading-[1.7] text-[var(--ink-400)]">
        {canEdit
          ? "Each service is one public page at /services/<url>. A service stays hidden until you tick Published, so you can write it in the open without anyone reading a half-finished draft."
          : "These are the services listed on the site. Only a super admin can change them."}
      </p>

      {canEdit && <NewServiceForm />}

      {services.length === 0 ? (
        <p className="text-[14px] text-[var(--ink-400)]">
          Nothing here yet. Add the first service above.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(420px,1fr))] items-start gap-5">
          {services.map((service) => (
            <ServiceEditor
              key={service.id}
              service={service}
              faqs={faqsByService.get(service.id) ?? []}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}
    </AdminShell>
  );
}
