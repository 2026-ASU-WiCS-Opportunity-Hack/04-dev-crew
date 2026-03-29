import { notFound } from 'next/navigation';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { requireChapterDashboardAccess } from '@/lib/chapter-access';
import CreateJobForm from '@/components/jobs/CreateJobForm';
import type { JobListingRecord } from '@/lib/types';

interface Props { params: { id: string } }

export default async function EditJobPage({ params }: Props) {
  const [{ chapter }, supabase] = [await requireChapterDashboardAccess(), createSupabaseAdminClient()];
  if (!chapter) return null;

  const { data: listing } = await supabase
    .from('job_listings')
    .select('*')
    .eq('id', params.id)
    .single<JobListingRecord>();

  if (!listing) notFound();

  return (
    <>
      <div style={{ marginBottom: '1.75rem' }}>
        <span className="eyebrow">Chapter Dashboard</span>
        <h1 style={{ margin: '0.75rem 0 0.4rem', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Edit Listing
        </h1>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>{listing.title} · {listing.organization}</p>
      </div>

      <CreateJobForm mode="edit" chapterId={listing.chapter_id ?? chapter.id} initialValues={listing} />
    </>
  );
}
