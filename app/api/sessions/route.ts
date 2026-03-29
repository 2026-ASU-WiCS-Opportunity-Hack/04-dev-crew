import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const coachId = searchParams.get('coach_id');

  if (!coachId) {
    return NextResponse.json({ ok: false, error: 'coach_id is required.' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('session_logs')
    .select('*')
    .eq('coach_id', coachId)
    .order('session_date', { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from('session_logs')
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Failed to log session.' }, { status: 500 });
  }
}
