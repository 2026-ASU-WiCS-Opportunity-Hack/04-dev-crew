import { notFound } from 'next/navigation';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import CoachDirectory from '@/components/coaches/CoachDirectory';
import type { CoachRecord, ChapterRecord } from '@/lib/types';

export const revalidate = 60; // ISR: serve cached, rebuild in background every 60s

interface Props {
  params: { chapter: string };
}

export default async function ChapterCoachesPage({ params }: Props) {
  const supabase = createSupabaseAdminClient();

  const { data: chapter } = await supabase
    .from('chapters')
    .select('*')
    .eq('slug', params.chapter)
    .eq('is_active', true)
    .single<ChapterRecord>();

  if (!chapter) notFound();

  const { data: coaches } = await supabase
    .from('coaches')
    .select('*, chapters(name, slug)')
    .eq('chapter_id', chapter.id)
    .eq('is_approved', true)
    .order('full_name');

  const coachList = (coaches ?? []).map((c: any) => ({
    ...c,
    chapter_name: c.chapters?.name ?? null,
  })) as (CoachRecord & { chapter_name?: string })[];

  return (
    <>
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">{chapter.name}</span>
          <h1 className="section-title" style={{ marginTop: '0.75rem' }}>Chapter Coaches</h1>
          <p className="section-copy">
            Certified Action Learning coaches from the {chapter.name} chapter.
          </p>
        </div>
      </section>

      <div className="page-divider" />

      <section className="section">
        <div className="container">
          <CoachDirectory coaches={coachList} />
        </div>
      </section>
    </>
  );
}
