import Link from 'next/link';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { JobListingRecord } from '@/lib/types';

const TYPE_LABELS: Record<string, string> = {
  full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', project: 'Project',
};

export default async function ChapterJobsPage() {
  const supabase = createSupabaseAdminClient();

  const { data: listings } = await supabase
    .from('job_listings')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<JobListingRecord[]>();

  // Get application counts per listing
  const { data: counts } = await supabase
    .from('job_applications')
    .select('listing_id');

  const countMap = (counts ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.listing_id] = (acc[r.listing_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <span className="eyebrow">Chapter Dashboard</span>
          <h1 style={{ margin: '0.75rem 0 0.4rem', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Job Listings
          </h1>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
            Manage coaching opportunities posted to the job board.
          </p>
        </div>
        <Link href="/dashboard/chapter/jobs/new" className="button-primary" style={{ fontSize: '0.88rem', alignSelf: 'flex-end' }}>
          + Post a Job
        </Link>
      </div>

      {(listings ?? []).length === 0 ? (
        <div className="coaches-empty">
          <p style={{ fontWeight: 600, marginBottom: 8 }}>No job listings yet</p>
          <p style={{ fontSize: '0.88rem' }}>Post your first opportunity to attract WIAL coaches.</p>
        </div>
      ) : (
        <div className="dash-card">
          <div className="dash-card__body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Organization</th>
                  <th>Type</th>
                  <th>Deadline</th>
                  <th>Applications</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(listings ?? []).map((listing) => {
                  const appCount = countMap[listing.id] ?? 0;
                  const deadline = listing.apply_deadline
                    ? new Date(listing.apply_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—';

                  return (
                    <tr key={listing.id}>
                      <td style={{ fontWeight: 600 }}>{listing.title}</td>
                      <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{listing.organization}</td>
                      <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{TYPE_LABELS[listing.engagement_type]}</td>
                      <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{deadline}</td>
                      <td>
                        <span style={{
                          fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                          background: appCount > 0 ? '#dbeafe' : 'var(--surface-muted)',
                          color: appCount > 0 ? '#1d4ed8' : 'var(--muted)',
                        }}>
                          {appCount} {appCount === 1 ? 'applicant' : 'applicants'}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                          background: listing.is_active ? '#dcfce7' : '#f3f4f6',
                          color: listing.is_active ? '#15803d' : '#6b7280',
                        }}>
                          {listing.is_active ? 'Active' : 'Closed'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link href={`/dashboard/chapter/jobs/${listing.id}`} style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
                            View
                          </Link>
                          <Link href={`/dashboard/chapter/jobs/${listing.id}/edit`} style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
