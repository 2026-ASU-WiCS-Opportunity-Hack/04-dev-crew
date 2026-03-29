import { requireChapterDashboardAccess } from '@/lib/chapter-access';
import CreateJobForm from '@/components/jobs/CreateJobForm';

export default async function NewJobPage() {
  const { chapter } = await requireChapterDashboardAccess();
  if (!chapter) return null;

  return (
    <>
      <div style={{ marginBottom: '1.75rem' }}>
        <span className="eyebrow">Chapter Dashboard</span>
        <h1 style={{ margin: '0.75rem 0 0.4rem', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Post a Job
        </h1>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
          Create a new coaching opportunity for WIAL-certified coaches to apply.
        </p>
      </div>

      <CreateJobForm mode="create" chapterId={chapter.id} />
    </>
  );
}
