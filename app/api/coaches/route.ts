import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from('coaches')
      .select('*, chapters(name, slug)')
      .eq('is_approved', true)
      .order('full_name');

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message ?? 'Failed to fetch coaches.' }, { status: 500 });
  }
}
