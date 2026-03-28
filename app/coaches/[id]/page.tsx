import { notFound } from 'next/navigation';
import Link from 'next/link';
import CoachProfile from '@/components/coaches/CoachProfile';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

export default async function CoachProfilePage({ params }: Props) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('coaches')
    .select('*, chapters(name, slug)')
    .eq('id', params.id)
    .single();

  if (error || !data) notFound();

  const coach = { ...data, chapter_name: (data as any).chapters?.name ?? null };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{ padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', borderBottom: '1px solid rgba(28,43,51,0.08)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)', textDecoration: 'none' }}>WIAL</Link>
        <div style={{ display: 'flex', gap: 24, fontSize: '0.9rem' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Home</Link>
          <Link href="/coaches" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 600 }}>Coaches</Link>
          <Link href="/dashboard/coach" style={{ textDecoration: 'none', color: 'var(--muted)' }}>My Dashboard</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        <CoachProfile coach={coach} />
      </main>
    </div>
  );
}
