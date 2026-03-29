'use client';

import { useState } from 'react';
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

const PAYMENT_TYPES: { key: PaymentType; label: string; description: string; amount: string }[] = [
  { key: 'membership', label: 'New Membership', description: 'Join or reinstate your WIAL membership', amount: 'Contact your chapter lead for pricing' },
  { key: 'renewal', label: 'Membership Renewal', description: 'Renew your existing annual membership', amount: 'Contact your chapter lead for pricing' },
  { key: 'certification', label: 'Certification Fee', description: 'Pay for your certification or recertification', amount: 'Contact your chapter lead for pricing' },
];

export default function MembershipCard({ coach, status, expiryDate, daysLeft }: MembershipCardProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedType, setSelectedType] = useState<PaymentType | null>(null);
  const [showRenew, setShowRenew] = useState(false);

  const cfg = STATUS_CONFIG[status];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

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

      {/* Renewal form */}
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
                >
                  <div style={{ flex: 1 }}>
                    <p className="payment-method-card__label">{pt.label}</p>
                    <p className="payment-method-card__sub">{pt.description}</p>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', whiteSpace: 'nowrap' }}>
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

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem' }}>
            <button
              className="button-primary"
              disabled={!selectedType || !selectedMethod}
              style={{ opacity: (!selectedType || !selectedMethod) ? 0.5 : 1, cursor: (!selectedType || !selectedMethod) ? 'not-allowed' : 'pointer' }}
              onClick={() => alert('Payment integration coming soon — your chapter lead will be notified.')}
            >
              Proceed to Payment
            </button>
            <button className="button-secondary" onClick={() => { setShowRenew(false); setSelectedMethod(null); setSelectedType(null); }}>
              Cancel
            </button>
          </div>
          <p className="form-hint" style={{ marginTop: '0.75rem' }}>
            Payment amounts are set by your chapter lead. You will be redirected to complete payment securely.
          </p>
        </div>
      )}

      {/* Payment history placeholder */}
      <div className="dash-card">
        <div className="dash-card__header">
          <h2 className="dash-card__title">Payment History</h2>
        </div>
        <div className="dash-card__body">
          <div className="coaches-empty" style={{ padding: '2rem 0' }}>
            <p style={{ fontSize: '0.9rem' }}>No payment records found. Your payment history will appear here once integrated.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
