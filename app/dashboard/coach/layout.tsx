import { requireCoach } from '@/lib/auth/server';
import DashboardSidebar from '@/components/coaches/DashboardSidebar';

export default async function CoachDashboardLayout({ children }: { children: React.ReactNode }) {
  const { coach } = await requireCoach();

  return (
    <div className="dash-shell">
      <DashboardSidebar coach={coach} />
      <div className="dash-main">{children}</div>
    </div>
  );
}
