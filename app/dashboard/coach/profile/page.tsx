import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import CoachProfileEditor from '@/components/coaches/CoachProfileEditor';
import type { CoachRecord } from '@/lib/types';

const CRAIG_UUID = '56679f4e-9ef6-4c0a-a6e0-73069576c263';

export default async function CoachProfilePage() {
  const supabase = createSupabaseServerClient();
  const { data: me } = await supabase
    .from('coaches')
    .select('*')
    .eq('id', CRAIG_UUID)
    .single<CoachRecord>();

  if (!me) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <p style={{ color: 'var(--muted)' }}>Coach profile not found.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', borderBottom: '1px solid rgba(28,43,51,0.08)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)', textDecoration: 'none' }}>WIAL</Link>
        <div style={{ display: 'flex', gap: 20, fontSize: '0.88rem' }}>
          <Link href="/dashboard/coach" style={{ textDecoration: 'none', color: 'var(--muted)' }}>← Dashboard</Link>
          <Link href={`/coaches/${me.id}`} style={{ textDecoration: 'none', color: 'var(--accent)', fontWeight: 600 }}>View Public Profile</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: '0 0 6px', color: 'var(--accent)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Coach Dashboard</p>
          <h1 style={{ margin: '0 0 6px', fontSize: '1.8rem', fontWeight: 800 }}>Edit Profile</h1>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
            Your profile is your public-facing marketing page. Use "Enhance with AI" to generate a professional bio from your rough notes.
          </p>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid rgba(28,43,51,0.08)', borderRadius: 16, padding: 28 }}>
          <CoachProfileEditor coach={me} />
        </div>
      </main>
    </div>
  );
}
