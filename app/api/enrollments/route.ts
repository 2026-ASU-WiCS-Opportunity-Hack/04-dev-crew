import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sendEnrollmentEmails } from '@/lib/email/send';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chapter_id, company_name, company_code, total_licenses, contact_email, contact_name } = body;

    if (!chapter_id || !company_name || !company_code) {
      return NextResponse.json(
        { ok: false, error: 'chapter_id, company_name, and company_code are required.' },
        { status: 400 },
      );
    }

    // Get current user id
    const serverClient = createSupabaseServerClient();
    const { data: { user } } = await serverClient.auth.getUser();

    const supabase = createSupabaseAdminClient();

    const { error: insertError } = await supabase.from('enrollments').insert({
      chapter_id,
      company_name,
      company_code: (company_code as string).toUpperCase(),
      total_licenses: total_licenses ?? 1,
      contact_email: contact_email || null,
      contact_name: contact_name || null,
      created_by: user?.id ?? null,
    });

    if (insertError) {
      return NextResponse.json({ ok: false, error: insertError.message }, { status: 400 });
    }

    // Fetch chapter name and chapter lead email for emails
    const { data: chapter } = await supabase
      .from('chapters')
      .select('name')
      .eq('id', chapter_id)
      .maybeSingle();

    const { data: chapterLead } = await supabase
      .from('profiles')
      .select('email')
      .eq('chapter_id', chapter_id)
      .eq('role', 'chapter_lead')
      .maybeSingle();

    await sendEnrollmentEmails({
      contactEmail: contact_email || null,
      contactName: contact_name || null,
      chapterLeadEmail: chapterLead?.email ?? null,
      companyName: company_name,
      totalLicenses: total_licenses ?? 1,
      chapterName: (chapter as { name?: string } | null)?.name ?? 'Your Chapter',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    }).catch((err) => console.error('[enrollments/POST] Failed to send enrollment emails:', err));

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create enrollment.';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
