import { AdminSidebar } from "@/components/admin/AdminSidebar";
import type { StaffSession } from "@/lib/admin/auth";

/**
 * Signed-in chrome: sidebar on the left, page on the right. Below 860px the
 * sidebar folds into a bar across the top. Login, no-access and
 * set-password render without it.
 */
export function AdminShell({
  session,
  children,
}: {
  session: StaffSession;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex to-860:flex-col">
      <AdminSidebar session={session} />

      <main className="flex-1 min-w-0 px-8 py-10 to-860:px-6">
        <div className="max-w-[1240px]">{children}</div>
      </main>
    </div>
  );
}
