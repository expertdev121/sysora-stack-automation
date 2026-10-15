import { AdminSidebar } from "@/components/admin/AdminSidebar";
import type { StaffSession } from "@/lib/admin/auth";
import { getNavCounts } from "@/lib/admin/console";

/**
 * Signed-in chrome: sidebar on the left, page on the right. Below 860px the
 * sidebar folds into a bar across the top. Login, no-access and
 * set-password render without it.
 *
 * The queue counts are read here rather than per page, so every page
 * shows the same badges without each one having to ask.
 */
export async function AdminShell({
  session,
  children,
}: {
  session: StaffSession;
  children: React.ReactNode;
}) {
  const counts = await getNavCounts();

  return (
    <div className="min-h-screen flex to-860:flex-col">
      <AdminSidebar session={session} counts={counts} />

      <main className="flex-1 min-w-0 px-8 py-10 to-860:px-6">
        <div className="max-w-[1240px]">{children}</div>
      </main>
    </div>
  );
}
