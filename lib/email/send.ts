import { Resend } from 'resend';
import { getOptionalResendKey } from '@/lib/env';

function getResend(): Resend | null {
  const key = getOptionalResendKey();
  if (!key) return null;
  return new Resend(key);
}

const FROM = 'WIAL Platform <onboarding@resend.dev>';

// ─── Templates ────────────────────────────────────────────────────────────────

function baseHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr><td style="background:#1a56db;padding:28px 32px;">
          <span style="color:#fff;font-size:1.3rem;font-weight:700;letter-spacing:0.02em;">WIAL Platform</span>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 20px;font-size:1.25rem;color:#111;">${title}</h1>
          ${body}
          <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:0.78rem;color:#9ca3af;">World Institute for Action Learning &bull; wial.org</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#1a56db;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.9rem;">${label}</a>`;
}

// ─── Email senders ─────────────────────────────────────────────────────────────

export async function sendCoachWelcomeEmail({
  to,
  name,
  siteUrl,
}: {
  to: string;
  name: string;
  siteUrl: string;
}) {
  const resend = getResend();
  if (!resend) return;

  const body = `
    <p style="color:#374151;line-height:1.6;">Hi ${name},</p>
    <p style="color:#374151;line-height:1.6;">
      Your coach account on the WIAL Platform has been created. Once approved by your chapter administrator,
      you'll be able to log in and access your dashboard to complete your profile, track CE credits,
      apply for jobs, and manage your certification.
    </p>
    <p style="color:#374151;line-height:1.6;">We're glad to have you in the WIAL community!</p>
    ${btn(`${siteUrl}/login`, 'Log in to Dashboard')}
  `;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Welcome to WIAL, ${name}!`,
    html: baseHtml(`Welcome to WIAL, ${name}!`, body),
  });
}

export async function sendPaymentConfirmationEmail({
  to,
  name,
  membershipType,
  amountCents,
  newExpiry,
  siteUrl,
}: {
  to: string;
  name: string;
  membershipType: string;
  amountCents: number;
  newExpiry: string;
  siteUrl: string;
}) {
  const resend = getResend();
  if (!resend) return;

  const amount = (amountCents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const expiry = new Date(newExpiry).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const level = membershipType.charAt(0).toUpperCase() + membershipType.slice(1);

  const body = `
    <p style="color:#374151;line-height:1.6;">Hi ${name},</p>
    <p style="color:#374151;line-height:1.6;">
      We've received your <strong>${level}</strong> membership payment of <strong>${amount}</strong>.
      Your certification has been extended and is now valid through <strong>${expiry}</strong>.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
      <tr style="background:#f9fafb;">
        <td style="padding:10px 14px;color:#6b7280;font-size:0.85rem;">Membership type</td>
        <td style="padding:10px 14px;color:#111;font-weight:600;font-size:0.85rem;">${level}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;color:#6b7280;font-size:0.85rem;">Amount paid</td>
        <td style="padding:10px 14px;color:#111;font-weight:600;font-size:0.85rem;">${amount}</td>
      </tr>
      <tr style="background:#f9fafb;">
        <td style="padding:10px 14px;color:#6b7280;font-size:0.85rem;">Valid through</td>
        <td style="padding:10px 14px;color:#111;font-weight:600;font-size:0.85rem;">${expiry}</td>
      </tr>
    </table>
    ${btn(`${siteUrl}/dashboard/coach/membership`, 'View Membership')}
  `;

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your WIAL membership payment was received',
    html: baseHtml('Payment Confirmed', body),
  });
}

export async function sendChapterPaymentReceiptEmail({
  to,
  name,
  chapterName,
  amountCents,
  siteUrl,
}: {
  to: string;
  name: string;
  chapterName: string;
  amountCents: number;
  siteUrl: string;
}) {
  const resend = getResend();
  if (!resend) return;

  const amount = (amountCents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const body = `
    <p style="color:#374151;line-height:1.6;">Hi ${name},</p>
    <p style="color:#374151;line-height:1.6;">
      Your chapter dues payment of <strong>${amount}</strong> for <strong>${chapterName}</strong> has been received and confirmed.
      Thank you — your chapter is now in good standing.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
      <tr style="background:#f9fafb;">
        <td style="padding:10px 14px;color:#6b7280;font-size:0.85rem;">Chapter</td>
        <td style="padding:10px 14px;color:#111;font-weight:600;font-size:0.85rem;">${chapterName}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;color:#6b7280;font-size:0.85rem;">Amount paid</td>
        <td style="padding:10px 14px;color:#111;font-weight:600;font-size:0.85rem;">${amount}</td>
      </tr>
    </table>
    ${btn(`${siteUrl}/dashboard/chapter/payments`, 'View Payment History')}
  `;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Payment confirmed — ${chapterName} chapter dues`,
    html: baseHtml('Chapter Dues Payment Confirmed', body),
  });
}

export async function sendAdminChapterPaymentAlertEmail({
  to,
  chapterName,
  payerName,
  payerEmail,
  amountCents,
  siteUrl,
}: {
  to: string;
  chapterName: string;
  payerName: string | null;
  payerEmail: string | null;
  amountCents: number;
  siteUrl: string;
}) {
  const resend = getResend();
  if (!resend) return;

  const amount = (amountCents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const paidBy = payerName ?? payerEmail ?? 'Unknown';

  const body = `
    <p style="color:#374151;line-height:1.6;">A chapter dues payment has been received.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
      <tr style="background:#f9fafb;">
        <td style="padding:10px 14px;color:#6b7280;font-size:0.85rem;">Chapter</td>
        <td style="padding:10px 14px;color:#111;font-weight:600;font-size:0.85rem;">${chapterName}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;color:#6b7280;font-size:0.85rem;">Paid by</td>
        <td style="padding:10px 14px;color:#111;font-weight:600;font-size:0.85rem;">${paidBy}${payerEmail ? ` &lt;${payerEmail}&gt;` : ''}</td>
      </tr>
      <tr style="background:#f9fafb;">
        <td style="padding:10px 14px;color:#6b7280;font-size:0.85rem;">Amount</td>
        <td style="padding:10px 14px;color:#111;font-weight:600;font-size:0.85rem;">${amount}</td>
      </tr>
    </table>
    ${btn(`${siteUrl}/dashboard/admin`, 'View Admin Dashboard')}
  `;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Chapter payment received — ${chapterName} (${amount})`,
    html: baseHtml('Chapter Payment Received', body),
  });
}

export async function sendRsvpConfirmationEmail({
  to,
  name,
  eventTitle,
  eventDate,
  eventLocation,
  siteUrl,
}: {
  to: string;
  name: string;
  eventTitle: string;
  eventDate: string | null;
  eventLocation: string | null;
  siteUrl: string;
}) {
  const resend = getResend();
  if (!resend) return;

  const dateStr = eventDate
    ? new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const body = `
    <p style="color:#374151;line-height:1.6;">Hi ${name},</p>
    <p style="color:#374151;line-height:1.6;">
      Your spot is confirmed for <strong>${eventTitle}</strong>${dateStr ? ` on <strong>${dateStr}</strong>` : ''}.
      ${eventLocation ? `The event will be held at <strong>${eventLocation}</strong>.` : ''}
    </p>
    <p style="color:#374151;line-height:1.6;">
      We'll see you there! If your plans change, you can cancel your RSVP from the events page.
    </p>
    ${btn(`${siteUrl}/events`, 'View Events')}
  `;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `You're registered for ${eventTitle}`,
    html: baseHtml(`You're registered!`, body),
  });
}
