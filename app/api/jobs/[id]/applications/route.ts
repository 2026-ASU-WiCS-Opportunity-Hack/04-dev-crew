import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { sendJobApplicationStatusEmail } from '@/lib/email/send';

interface Params { params: { id: string } }

// GET /api/jobs/[id]/applications — all applicants for a listing
export async function GET(_req: Request, { params }: Params) {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('job_applications')
      .select('*, coach:coaches(id, full_name, certification_level, location_country, contact_email)')
      .eq('listing_id', params.id)
      .order('created_at');

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// PATCH /api/jobs/[id]/applications — update application status
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { application_id, status } = await request.json();
    if (!application_id || !status) return NextResponse.json({ ok: false, error: 'application_id and status are required.' }, { status: 400 });

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('job_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', application_id)
      .eq('listing_id', params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    // Notify coach of status change (only for meaningful statuses)
    if (['shortlisted', 'rejected', 'hired'].includes(status)) {
      const { data: appDetails } = await supabase
        .from('job_applications')
        .select('coach:coaches(full_name, contact_email), listing:job_listings(title)')
        .eq('id', application_id)
        .maybeSingle();

      const coach = appDetails?.coach as { full_name?: string; contact_email?: string } | null;
      const listing = appDetails?.listing as { title?: string } | null;

      if (coach?.contact_email && listing?.title) {
        await sendJobApplicationStatusEmail({
          to: coach.contact_email,
          coachName: coach.full_name ?? 'Coach',
          jobTitle: listing.title,
          status,
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
        }).catch((err) => console.error('[applications/PATCH] Failed to send status email:', err));
      }
    }

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
