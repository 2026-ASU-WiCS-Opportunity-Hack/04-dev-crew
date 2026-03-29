import { notFound } from 'next/navigation';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { ChapterRecord } from '@/lib/types';

export const revalidate = 60;

interface Props {
  params: { chapter: string };
}

export default async function ChapterHomePage({ params }: Props) {
  const supabase = createSupabaseAdminClient();

  const { data: chapter } = await supabase
    .from('chapters')
    .select('*')
    .eq('slug', params.chapter)
    .eq('is_active', true)
    .single<ChapterRecord>();

  if (!chapter) notFound();

  return (
    <>
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">WIAL Chapter</span>
          <h1 className="section-title" style={{ marginTop: '0.75rem' }}>{chapter.name}</h1>
          {chapter.content_json?.about_section && (
            <p className="section-copy">{chapter.content_json.about_section.slice(0, 200)}…</p>
          )}
        </div>
      </section>

      <div className="page-divider" />

      <section className="section">
        <div className="container">
          <p style={{ color: 'var(--muted)' }}>
            Browse <a href={`/${params.chapter}/coaches`} style={{ color: 'var(--accent)', fontWeight: 600 }}>coaches from this chapter →</a>
          </p>
        </div>
      </section>
    </>
  );
}
