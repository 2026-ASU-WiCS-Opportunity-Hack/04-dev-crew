import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import JobApplicationsTable from '@/components/jobs/JobApplicationsTable';
import type { JobListingRecord, JobApplicationRecord } from '@/lib/types';

const TYPE_LABELS: Record<string, string> = {
  full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', project: 'Project',
};

interface Props { params: { id: string } }

export default async function ChapterJobDetailPage({ params }: Props) {
  const supabase = createSupabaseAdminClient();

  const [{ data: listing }, { data: applications }] = await Promise.all([
    supabase
      .from('job_listings')
      .select('*')
      .eq('id', params.id)
      .single<JobListingRecord>(),
    supabase
      .from('job_applications')
      .select('*, coach:coaches(id, full_name, certification_level, location_country, contact_email)')
      .eq('listing_id', params.id)
      .order('created_at')
      .returns<JobApplicationRecord[]>(),
  ]);

  if (!listing) notFound();

  const deadline = listing.apply_deadline
    ? new Date(listing.apply_deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/dashboard/chapter/jobs" className="button-secondary" style={{ fontSize: '0.82rem', marginBottom: '1.25rem', display: 'inline-block' }}>
          ← Back to Listings
        </Link>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="eyebrow">Chapter Dashboard</span>
            <h1 style={{ margin: '0.75rem 0 0.25rem', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              {listing.title}
            </h1>
            <p style={{ margin: 0, fontSize: '1rem', color: 'var(--accent)', fontWeight: 600 }}>{listing.organization}</p>
          </div>
          <Link href={`/dashboard/chapter/jobs/${listing.id}/edit`} className="button-secondary" style={{ fontSize: '0.88rem', alignSelf: 'flex-start' }}>
            Edit Listing
          </Link>
        </div>
      </div>

      {/* Listing info */}
      <div className="dash-card" style={{ marginBottom: '1.5rem' }}>
        <div className="dash-card__body">
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
            <span>💼 {TYPE_LABELS[listing.engagement_type]}</span>
            <span>📍 {listing.is_remote ? 'Remote' : (listing.location ?? 'Location TBD')}</span>
            {listing.compensation && <span>💰 {listing.compensation}</span>}
            {deadline && <span>⏰ Apply by {deadline}</span>}
            <span style={{ color: listing.is_active ? '#15803d' : '#6b7280', fontWeight: 700 }}>
              {listing.is_active ? '● Active' : '● Closed'}
            </span>
          </div>
          <p style={{ margin: '0 0 1rem', fontSize: '0.88rem', lineHeight: 1.7 }}>{listing.description}</p>
          {listing.requirements && (
            <>
              <p style={{ margin: '0 0 0.4rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Requirements</p>
              <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--muted)' }}>{listing.requirements}</p>
            </>
          )}
        </div>
      </div>

      {/* Applications */}
      <div className="dash-card">
        <div className="dash-card__header">
          <h2 className="dash-card__title">Applications</h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>
            {(applications ?? []).length} received
          </span>
        </div>
        <div className="dash-card__body" style={{ padding: 0 }}>
          <JobApplicationsTable
            listingId={listing.id}
            initialApplications={applications ?? []}
          />
        </div>
      </div>
    </>
  );
}
