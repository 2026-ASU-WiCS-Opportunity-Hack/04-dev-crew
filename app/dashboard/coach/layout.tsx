import { getCoach } from '@/lib/data/coach';
import DashboardSidebar from '@/components/coaches/DashboardSidebar';

const CRAIG_UUID = '56679f4e-9ef6-4c0a-a6e0-73069576c263';

export default async function CoachDashboardLayout({ children }: { children: React.ReactNode }) {
  const coach = await getCoach(CRAIG_UUID);

  return (
    <div className="dash-shell">
      <DashboardSidebar coach={coach} />
      <div className="dash-main">{children}</div>
    </div>
  );
}
