"use client";

import { useState } from "react";
import type { PaymentType } from "@/lib/types";

interface PaymentFormProps {
  chapterId: string;
  showPaypal?: boolean;
}

export function PaymentForm({ chapterId, showPaypal }: PaymentFormProps) {
  const [payerName, setPayerName] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("enrollment");
  const [studentCount, setStudentCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountCents =
    paymentType === "enrollment" ? 5000 * studentCount : 3000 * studentCount;
  const amountDisplay = `$${(amountCents / 100).toFixed(2)}`;

  async function handleStripe() {
    if (!payerName || !payerEmail) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId,
          payerName,
          payerEmail,
          paymentType,
          studentCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");

      const url = data.data?.checkoutUrl ?? data.checkoutUrl;
      if (url) window.location.href = url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  async function handlePaypal() {
    if (!payerName || !payerEmail) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId,
          payerName,
          payerEmail,
          paymentType,
          studentCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "PayPal order failed");

      const url = data.data?.approvalUrl ?? data.approvalUrl;
      if (url) window.location.href = url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "PayPal failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <div className="contact-form" style={{ gap: "1rem" }}>
        <div className="contact-form__field-group">
          <label className="contact-form__label">Your Name <span>*</span></label>
          <input
            type="text"
            value={payerName}
            onChange={(e) => setPayerName(e.target.value)}
          />
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">Your Email <span>*</span></label>
          <input
            type="email"
            value={payerEmail}
            onChange={(e) => setPayerEmail(e.target.value)}
          />
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">Payment Type</label>
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value as PaymentType)}
          >
            <option value="enrollment">Enrollment ($50/student)</option>
            <option value="certification">Certification ($30/student)</option>
          </select>
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">Number of Students</label>
          <input
            type="number"
            value={studentCount}
            onChange={(e) => setStudentCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
            min={1}
          />
        </div>
      </div>

      <p style={{ fontSize: "1.15rem", fontWeight: 700 }}>
        Total: {amountDisplay} USD
      </p>

      {error && <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>{error}</p>}

      <div className="stack-actions">
        <button
          type="button"
          onClick={handleStripe}
          disabled={loading || !payerName || !payerEmail}
          className="button-primary"
          style={{ opacity: loading || !payerName || !payerEmail ? 0.5 : 1 }}
        >
          {loading ? "Processing..." : "Pay with Stripe"}
        </button>
        {showPaypal && (
          <button
            type="button"
            onClick={handlePaypal}
            disabled={loading || !payerName || !payerEmail}
            className="button-secondary"
            style={{ background: "#f3b313", color: "#17233a", borderColor: "transparent", opacity: loading || !payerName || !payerEmail ? 0.5 : 1 }}
          >
            {loading ? "Processing..." : "Pay with PayPal"}
          </button>
        )}
      </div>
    </div>
  );
}
