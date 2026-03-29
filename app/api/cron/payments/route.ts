import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { generateReminderEmail } from '@/lib/ai/generate-reminder';
import { Resend } from 'resend';
import { getOptionalResendKey } from '@/lib/env';

// Vercel calls this route on the schedule defined in vercel.json
// Protect with CRON_SECRET so only Vercel can trigger it
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const results = { markedOverdue: 0, remindersSent: 0, errors: [] as string[] };

  // ── 1. Mark pending payments as overdue if past their due_date ────────────
  const { data: overdueRows, error: overdueErr } = await supabase
    .from('payments')
    .update({ status: 'overdue' })
    .eq('status', 'pending')
    .lt('due_date', now.slice(0, 10))
    .select('id, payer_name, payer_email, chapter_id, amount_cents');

  if (overdueErr) {
    results.errors.push(`Mark overdue: ${overdueErr.message}`);
  } else {
    results.markedOverdue = overdueRows?.length ?? 0;
  }

  // ── 2. Send reminder emails for overdue payments ──────────────────────────
  const { data: overduePayments } = await supabase
    .from('payments')
    .select('id, payer_name, payer_email, amount_cents, due_date, reminder_count, chapters(name)')
    .eq('status', 'overdue')
    .lt('reminder_count', 3); // cap at 3 reminders

  const resendKey = getOptionalResendKey();
  const resend = resendKey ? new Resend(resendKey) : null;

  for (const payment of overduePayments ?? []) {
    if (!payment.payer_email || !resend) continue;

    const chapterName = (payment.chapters as { name?: string } | null)?.name ?? 'Your Chapter';
    const amount = ((payment.amount_cents ?? 0) / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    const dueDate = payment.due_date
      ? new Date(payment.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'recently';

    const attempt = (payment.reminder_count ?? 0) + 1;

    try {
      await resend.emails.send({
        from: 'WIAL Platform <onboarding@resend.dev>',
        to: payment.payer_email,
        subject: `Action required: WIAL chapter dues overdue (${chapterName})`,
        html: `
          <div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;line-height:1.6;max-width:560px;margin:0 auto;padding:32px;">
            <h2 style="color:#dc2626;">Payment Overdue</h2>
            <p>Hi ${payment.payer_name},</p>
            <p>Your chapter dues payment of <strong>${amount}</strong> for <strong>${chapterName}</strong> was due on <strong>${dueDate}</strong> and has not been received (reminder ${attempt} of 3).</p>
            <p>Please log in to complete your payment at your earliest convenience to keep your chapter in good standing.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/dashboard/chapter/payments"
               style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1a56db;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
              Pay Now
            </a>
            <p style="margin-top:24px;color:#6b7280;font-size:0.85rem;">WIAL Platform &bull; wial.org</p>
          </div>
        `,
      });

      // Increment reminder_count
      await supabase
        .from('payments')
        .update({ reminder_count: attempt })
        .eq('id', payment.id);

      results.remindersSent++;
    } catch (err) {
      results.errors.push(`Payment ${payment.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log('[cron/payments]', results);
  return NextResponse.json({ ok: true, ...results });
}
