import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { sendCoachApprovalEmail } from '@/lib/email/send';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { approved } = await request.json() as { approved: boolean };
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase
      .from('coaches')
      .update({ is_approved: approved })
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    const { data: coach } = await supabase
      .from('coaches')
      .select('full_name, contact_email')
      .eq('id', params.id)
      .maybeSingle();

    if (coach?.contact_email) {
      await sendCoachApprovalEmail({
        to: coach.contact_email,
        name: coach.full_name,
        approved,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
      }).catch((err) => console.error('[approve] Failed to send approval email:', err));
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to update approval status.' }, { status: 500 });
  }
}
