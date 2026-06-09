import { requireUser } from "../auth";
import { Sidebar } from "../_components/Sidebar";

/**
 * Guarded chrome for all protected admin pages. `requireUser()` redirects to
 * /admin/login when there is no session. The login page sits outside this
 * route group, so it renders without the guard or sidebar.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireUser();

  return (
    <div className="flex min-h-dvh">
      <Sidebar email={user.email ?? ""} />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-5xl p-6 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
