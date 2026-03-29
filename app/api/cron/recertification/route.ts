import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { generateReminderEmail } from '@/lib/ai/generate-reminder';
import { Resend } from 'resend';
import { getOptionalResendKey } from '@/lib/env';
import type { CertificationLevel } from '@/lib/types';

// Reminder windows: send at 90 days, 60 days, 30 days before expiry
const REMINDER_WINDOWS_DAYS = [90, 60, 30];

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const resendKey = getOptionalResendKey();
  const resend = resendKey ? new Resend(resendKey) : null;
  const results = { checked: 0, remindersSent: 0, errors: [] as string[] };

  const today = new Date();

  for (const windowDays of REMINDER_WINDOWS_DAYS) {
    // Target date = today + windowDays
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + windowDays);
    const targetDateStr = targetDate.toISOString().slice(0, 10);

    // Find coaches expiring on exactly that date
    const { data: coaches, error } = await supabase
      .from('coaches')
      .select('id, full_name, contact_email, certification_level, certification_expiry, chapters(name)')
      .eq('certification_expiry', targetDateStr)
      .eq('is_approved', true)
      .not('contact_email', 'is', null);

    if (error) {
      results.errors.push(`Window ${windowDays}d: ${error.message}`);
      continue;
    }

    results.checked += coaches?.length ?? 0;

    for (const coach of coaches ?? []) {
      if (!coach.contact_email || !resend) continue;

      const chapterName = (coach.chapters as { name?: string } | null)?.name ?? undefined;

      try {
        // Use AI to generate a personalised reminder email
        const generated = await generateReminderEmail({
          coachName: coach.full_name,
          certificationLevel: coach.certification_level as CertificationLevel,
          expiryDate: coach.certification_expiry,
          chapterName,
          recipientEmail: coach.contact_email,
        });

        await resend.emails.send({
          from: 'WIAL Platform <onboarding@resend.dev>',
          to: coach.contact_email,
          subject: generated.subject,
          html: generated.bodyHtml,
        });

        results.remindersSent++;
      } catch (err) {
        results.errors.push(`Coach ${coach.id} (${windowDays}d): ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  console.log('[cron/recertification]', results);
  return NextResponse.json({ ok: true, ...results });
}
