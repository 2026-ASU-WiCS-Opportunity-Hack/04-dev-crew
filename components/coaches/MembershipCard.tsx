'use client';

import { useEffect, useState } from 'react';
import type { CoachRecord } from '@/lib/types';
import CertBadge from './CertBadge';

interface MembershipCardProps {
  coach: CoachRecord;
  status: 'active' | 'needs_renewal' | 'not_active';
  expiryDate: string | null;
  daysLeft: number | null;
}

const STATUS_CONFIG = {
  active: { label: 'Active', icon: '✓', description: 'Your membership is current and in good standing.' },
  needs_renewal: { label: 'Renewal Due Soon', icon: '⚠', description: 'Your membership expires soon. Renew now to stay active.' },
  not_active: { label: 'Not Active', icon: '✕', description: 'Your membership has expired. Renew to restore your active status.' },
};

type PaymentMethod = 'stripe' | 'paypal';
type PaymentType = 'membership' | 'renewal' | 'certification';

const PAYMENT_TYPES: { key: PaymentType; label: string; description: string; amount: string; amountCents: number }[] = [
  { key: 'membership', label: 'New Membership', description: 'Join or reinstate your WIAL membership', amount: '$100.00', amountCents: 10000 },
  { key: 'renewal', label: 'Membership Renewal', description: 'Renew your existing annual membership', amount: '$75.00', amountCents: 7500 },
  { key: 'certification', label: 'Certification Fee', description: 'Pay for your certification or recertification', amount: '$50.00', amountCents: 5000 },
];

export default function MembershipCard({ coach, status, expiryDate, daysLeft }: MembershipCardProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedType, setSelectedType] = useState<PaymentType | null>(null);
  const [showRenew, setShowRenew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const cfg = STATUS_CONFIG[status];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === '1') {
      setSuccessMsg('Payment completed successfully. Your membership will be updated shortly.');
    } else if (params.get('paypal') === 'success') {
      setSuccessMsg('PayPal payment completed. Your membership will be updated shortly.');
    } else if (params.get('canceled') === '1' || params.get('paypal') === 'canceled') {
      setError('Payment was canceled. No charge was made.');
    }
  }, []);

  async function handlePayment() {
    if (!selectedType || !selectedMethod) return;
    setLoading(true);
    setError(null);

    const payerName = coach.full_name;
    const payerEmail = coach.contact_email ?? '';

    if (!payerEmail) {
      setError('No email address on your coach profile. Please update your profile first.');
      setLoading(false);
      return;
    }

    try {
      if (selectedMethod === 'stripe') {
        const res = await fetch('/api/stripe/create-coach-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coachId: coach.id,
            payerName,
            payerEmail,
            membershipType: selectedType,
          }),
        });
        const data = await res.json();
        if (!data.ok) throw new Error(`${data.error ?? 'Checkout failed'}${data.details ? ` — ${JSON.stringify(data.details)}` : ''}`);
        if (data.data?.checkoutUrl) window.location.href = data.data.checkoutUrl;
      } else {
        const res = await fetch('/api/paypal/create-coach-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coachId: coach.id,
            payerName,
            payerEmail,
            membershipType: selectedType,
          }),
        });
        const data = await res.json();
        if (!data.ok) throw new Error(`${data.error ?? 'PayPal order failed'}${data.details ? ` — ${JSON.stringify(data.details)}` : ''}`);
        if (data.data?.approvalUrl) window.location.href = data.data.approvalUrl;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {successMsg && (
        <div style={{ padding: '0.9rem 1.25rem', borderRadius: 8, background: '#d1fae5', color: '#065f46', fontWeight: 600, fontSize: '0.9rem' }}>
          ✓ {successMsg}
        </div>
      )}

      {error && !showRenew && (
        <div style={{ padding: '0.9rem 1.25rem', borderRadius: 8, background: '#fee2e2', color: '#dc2626', fontWeight: 600, fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Status card */}
      <div className="dash-card">
        <div className="dash-card__header">
          <h2 className="dash-card__title">Membership Status</h2>
          <span className={`membership-status-badge membership-status-badge--${status}`}>
            {cfg.icon} {cfg.label}
          </span>
        </div>
        <div className="dash-card__body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Certification Level</p>
              <CertBadge level={coach.certification_level} size="lg" />
            </div>
            {expiryDate && (
              <div>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>
                  {status === 'not_active' ? 'Expired On' : 'Expires On'}
                </p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{expiryDate}</p>
              </div>
            )}
            {daysLeft !== null && daysLeft > 0 && (
              <div>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Days Remaining</p>
                <p style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: daysLeft <= 30 ? 'var(--brand)' : daysLeft <= 90 ? '#a16207' : '#15803d' }}>
                  {daysLeft}
                </p>
              </div>
            )}
          </div>

          <p style={{ margin: '0 0 1.25rem', fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.6 }}>
            {cfg.description}
          </p>

          {status !== 'active' && !showRenew && (
            <button className="button-primary" onClick={() => setShowRenew(true)}>
              Renew Membership
            </button>
          )}
          {status === 'active' && !showRenew && (
            <button className="button-secondary" onClick={() => setShowRenew(true)}>
              Pay Dues / Certification Fee
            </button>
          )}
        </div>
      </div>

      {/* Payment form */}
      {showRenew && (
        <div className="form-section">
          <h3>Renew / Pay Dues</h3>

          {/* Payment type selection */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Select Payment Type</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {PAYMENT_TYPES.map((pt) => (
                <div
                  key={pt.key}
                  className={`payment-method-card${selectedType === pt.key ? ' payment-method-card--selected' : ''}`}
                  onClick={() => setSelectedType(pt.key)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ flex: 1 }}>
                    <p className="payment-method-card__label">{pt.label}</p>
                    <p className="payment-method-card__sub">{pt.description}</p>
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--brand)', whiteSpace: 'nowrap' }}>
                    {pt.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment method selection */}
          {selectedType && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Select Payment Method</label>
              <div className="payment-method-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div
                  className={`payment-method-card${selectedMethod === 'stripe' ? ' payment-method-card--selected' : ''}`}
                  onClick={() => setSelectedMethod('stripe')}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="payment-method-card__icon">💳</span>
                  <div>
                    <p className="payment-method-card__label">Credit / Debit Card</p>
                    <p className="payment-method-card__sub">Powered by Stripe</p>
                  </div>
                </div>
                <div
                  className={`payment-method-card${selectedMethod === 'paypal' ? ' payment-method-card--selected' : ''}`}
                  onClick={() => setSelectedMethod('paypal')}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="payment-method-card__icon">🅿️</span>
                  <div>
                    <p className="payment-method-card__label">PayPal</p>
                    <p className="payment-method-card__sub">Pay with PayPal account</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedType && (
            <p style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700 }}>
              Total: {PAYMENT_TYPES.find(p => p.key === selectedType)?.amount} USD
            </p>
          )}

          {error && (
            <p style={{ color: '#dc2626', fontSize: '0.9rem', margin: '0 0 0.75rem' }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem' }}>
            <button
              className="button-primary"
              disabled={!selectedType || !selectedMethod || loading}
              style={{ opacity: (!selectedType || !selectedMethod || loading) ? 0.5 : 1, cursor: (!selectedType || !selectedMethod || loading) ? 'not-allowed' : 'pointer' }}
              onClick={handlePayment}
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
            <button
              className="button-secondary"
              onClick={() => { setShowRenew(false); setSelectedMethod(null); setSelectedType(null); setError(null); }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
          <p className="form-hint" style={{ marginTop: '0.75rem' }}>
            You will be redirected to complete payment securely. Membership updates are processed within 24 hours.
          </p>
        </div>
      )}

      {/* Payment history */}
      <div className="dash-card">
        <div className="dash-card__header">
          <h2 className="dash-card__title">Payment History</h2>
        </div>
        <div className="dash-card__body">
          <div className="coaches-empty" style={{ padding: '2rem 0' }}>
            <p style={{ fontSize: '0.9rem' }}>No payment records found. Your payment history will appear here once you complete a payment.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
