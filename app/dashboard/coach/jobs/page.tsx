import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getCoach } from '@/lib/data/coach';
import JobListingsBoard from '@/components/jobs/JobListingsBoard';
import type { JobListingRecord } from '@/lib/types';

export const revalidate = 60;

const CRAIG_UUID = '56679f4e-9ef6-4c0a-a6e0-73069576c263';

export default async function CoachJobsPage() {
  const supabase = createSupabaseAdminClient();

  const [{ data: listings }, { data: applications }] = await Promise.all([
    supabase
      .from('job_listings')
      .select('*, chapter:chapters(id, name, country)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .returns<JobListingRecord[]>(),
    supabase
      .from('job_applications')
      .select('listing_id')
      .eq('coach_id', CRAIG_UUID),
  ]);

  const appliedIds = (applications ?? []).map((a) => a.listing_id as string);

  return (
    <>
      <div style={{ marginBottom: '1.75rem' }}>
        <span className="eyebrow">Coach Dashboard</span>
        <h1 style={{ margin: '0.75rem 0 0.4rem', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Job Board
        </h1>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
          Action Learning coaching opportunities posted by organizations worldwide.
        </p>
      </div>

      <JobListingsBoard
        listings={listings ?? []}
        coachId={CRAIG_UUID}
        initialAppliedIds={appliedIds}
      />
    </>
  );
}
