import { createSupabaseServerClient } from '@/lib/supabase/server';
import DashboardSidebar from '@/components/coaches/DashboardSidebar';

const CRAIG_UUID = '56679f4e-9ef6-4c0a-a6e0-73069576c263';

export default async function CoachDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient();
  const { data: coach } = await supabase
    .from('coaches')
    .select('id, full_name, certification_level')
    .eq('id', CRAIG_UUID)
    .single();

  return (
    <div className="dash-shell">
      <DashboardSidebar coach={coach} />
      <div className="dash-main">{children}</div>
    </div>
  );
}
