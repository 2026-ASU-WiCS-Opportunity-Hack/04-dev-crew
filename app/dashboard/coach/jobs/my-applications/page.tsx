import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { requireCoach } from '@/lib/auth/server';
import MyApplicationsList from '@/components/jobs/MyApplicationsList';
import type { JobApplicationRecord } from '@/lib/types';

export const revalidate = 30;

export default async function MyApplicationsPage() {
  const { coach } = await requireCoach();
  const supabase = createSupabaseAdminClient();

  const { data: applications } = await supabase
    .from('job_applications')
    .select('*, listing:job_listings(id, title, organization, engagement_type, location, is_remote)')
    .eq('coach_id', coach.id)
    .order('created_at', { ascending: false })
    .returns<JobApplicationRecord[]>();

  return (
    <>
      <div style={{ marginBottom: '1.75rem' }}>
        <span className="eyebrow">Coach Dashboard</span>
        <h1 style={{ margin: '0.75rem 0 0.4rem', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
          My Applications
        </h1>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
          Track the status of your job applications.
        </p>
      </div>

      <MyApplicationsList
        initialApplications={applications ?? []}
        coachId={coach.id}
      />
    </>
  );
}
