import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { sendCoachWelcomeEmail } from '@/lib/email/send';

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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch coaches.';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, contact_email, location_city, location_country, certification_level, chapter_id } = body;

    if (!full_name || !certification_level || !chapter_id) {
      return NextResponse.json({ ok: false, error: 'full_name, certification_level, and chapter_id are required.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('coaches')
      .insert({
        full_name,
        contact_email: contact_email || null,
        location_city: location_city || null,
        location_country: location_country || null,
        certification_level,
        chapter_id,
        is_approved: false,
        specializations: [],
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    // Send welcome email if contact_email provided
    if (data.contact_email) {
      await sendCoachWelcomeEmail({
        to: data.contact_email,
        name: data.full_name,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
      }).catch((err) => console.error('[coaches/POST] Failed to send welcome email:', err));
    }

    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to add coach.';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
