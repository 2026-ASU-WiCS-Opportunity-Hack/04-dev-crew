import CreateJobForm from '@/components/jobs/CreateJobForm';

// Hardcoded for demo — replace with real session chapter_id
const DEMO_CHAPTER_ID = '00000000-0000-0000-0000-000000000000';

export default function NewJobPage() {
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

      <CreateJobForm mode="create" chapterId={DEMO_CHAPTER_ID} />
    </>
  );
}
