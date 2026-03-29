import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: { id: string };
}

// POST /api/events/[id]/rsvp — create RSVP
export async function POST(request: Request, { params }: RouteParams) {
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
    const { data, error } = await supabase
      .from('event_rsvps')
      .insert({ event_id: params.id, coach_id })
      .select()
      .single();

    if (error) {
      // Unique constraint violation = already RSVPd
      if (error.code === '23505') {
        return NextResponse.json({ ok: false, error: 'Already RSVPd for this event.' }, { status: 409 });
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message ?? 'Failed to RSVP.' }, { status: 500 });
  }
}

// DELETE /api/events/[id]/rsvp — cancel RSVP
export async function DELETE(request: Request, { params }: RouteParams) {
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
    const { error } = await supabase
      .from('event_rsvps')
      .delete()
      .eq('event_id', params.id)
      .eq('coach_id', coach_id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message ?? 'Failed to cancel RSVP.' }, { status: 500 });
  }
}

// GET /api/events/[id]/rsvp — list all RSVPs for an event (for chapter lead)
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('event_rsvps')
      .select('*, coach:coaches(id, full_name, certification_level, location_country)')
      .eq('event_id', params.id)
      .order('created_at');

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message ?? 'Failed to fetch RSVPs.' }, { status: 500 });
  }
}
