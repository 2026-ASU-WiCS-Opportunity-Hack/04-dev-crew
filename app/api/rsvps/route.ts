import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { sendRsvpConfirmationEmail } from '@/lib/email/send';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_id, attendee_name, attendee_email } = body;

    if (!event_id || !attendee_name || !attendee_email) {
      return NextResponse.json(
        { ok: false, error: 'event_id, attendee_name, and attendee_email are required.' },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();

    const { error: insertError } = await supabase.from('rsvps').insert({
      event_id,
      attendee_name,
      attendee_email,
      status: 'registered',
    });

    if (insertError) {
      return NextResponse.json({ ok: false, error: insertError.message }, { status: 400 });
    }

    // Fetch event details for the confirmation email
    const { data: event } = await supabase
      .from('events')
      .select('title, start_date, location')
      .eq('id', event_id)
      .maybeSingle();

    if (event) {
      await sendRsvpConfirmationEmail({
        to: attendee_email,
        name: attendee_name,
        eventTitle: event.title,
        eventDate: event.start_date ?? null,
        eventLocation: event.location ?? null,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
      }).catch((err) => console.error('[rsvps/POST] Failed to send RSVP email:', err));
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'RSVP failed.';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
