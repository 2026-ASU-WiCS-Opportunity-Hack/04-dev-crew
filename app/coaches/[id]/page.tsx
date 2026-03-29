import { notFound } from 'next/navigation';
import CoachProfile from '@/components/coaches/CoachProfile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const revalidate = 60; // ISR: serve cached, rebuild in background every 60s

interface Props {
  params: { id: string };
}

export default async function CoachProfilePage({ params }: Props) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('coaches')
    .select('*, chapters(name, slug)')
    .eq('id', params.id)
    .single();

  if (error || !data) notFound();

  const coach = { ...data, chapter_name: (data as any).chapters?.name ?? null };

  return (
    <>
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">Coach Profile</span>
          <h1 className="section-title" style={{ marginTop: '0.75rem' }}>{coach.full_name}</h1>
        </div>
      </section>

      <div className="page-divider" />

      <section className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          <CoachProfile coach={coach} />
        </div>
      </section>
    </>
  );
}
