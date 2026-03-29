import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

interface Params { params: { id: string } }

// POST /api/jobs/[id]/apply
export async function POST(request: Request, { params }: Params) {
  try {
    const auth = await getAuthContext();
    if (!auth?.profile || auth.profile.role !== 'coach' || !auth.coach) {
      return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const { coach_id, cover_note } = await request.json();
    if (!coach_id || coach_id !== auth.coach.id) {
      return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 403 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('job_applications')
      .insert({ listing_id: params.id, coach_id, cover_note: cover_note || null })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return NextResponse.json({ ok: false, error: 'You have already applied for this job.' }, { status: 409 });
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/jobs/[id]/apply — withdraw application
export async function DELETE(request: Request, { params }: Params) {
  try {
    const auth = await getAuthContext();
    if (!auth?.profile || auth.profile.role !== 'coach' || !auth.coach) {
      return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const { coach_id } = await request.json();
    if (!coach_id || coach_id !== auth.coach.id) {
      return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 403 });
    }

    const supabase = createSupabaseAdminClient();

    // Only allow withdrawal if still pending
    const { data: existing } = await supabase
      .from('job_applications')
      .select('status')
      .eq('listing_id', params.id)
      .eq('coach_id', coach_id)
      .single();

    if (!existing) return NextResponse.json({ ok: false, error: 'Application not found.' }, { status: 404 });
    if (existing.status !== 'pending') return NextResponse.json({ ok: false, error: 'Only pending applications can be withdrawn.' }, { status: 403 });

    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('listing_id', params.id)
      .eq('coach_id', coach_id);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
