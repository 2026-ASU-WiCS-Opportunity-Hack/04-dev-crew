import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { sendContactFormEmail } from '@/lib/email/send';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, country, topic, message } = body;

    if (!firstName || !email || !message) {
      return NextResponse.json(
        { ok: false, error: 'Name, email, and message are required.' },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();
    const { data: branding } = await supabase
      .from('global_branding_settings')
      .select('executive_director_email')
      .eq('id', 'global')
      .maybeSingle();

    const adminEmail =
      (branding as { executive_director_email?: string } | null)?.executive_director_email ??
      'info@wial.org';

    await sendContactFormEmail({
      adminTo: adminEmail,
      senderEmail: email,
      senderName: `${firstName} ${lastName ?? ''}`.trim(),
      country: country ?? '',
      topic: topic ?? 'General Question',
      message,
    }).catch((err) => console.error('[contact] Failed to send contact email:', err));

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to send message.';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
