import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const auth = await getAuthContext();

  if (!auth?.profile || auth.profile.role !== 'coach' || !auth.coach) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const coachId = searchParams.get('coach_id');

  if (!coachId || coachId !== auth.coach.id) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 403 });
  }

  const supabase = createSupabaseServerClient();
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
    const auth = await getAuthContext();

    if (!auth?.profile || auth.profile.role !== 'coach' || !auth.coach) {
      return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    if (body.coach_id !== auth.coach.id) {
      return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 403 });
    }

    const supabase = createSupabaseServerClient();

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
