import { requireCoach } from '@/lib/auth/server';

export default async function CoachDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireCoach();
  return <>{children}</>;
}
