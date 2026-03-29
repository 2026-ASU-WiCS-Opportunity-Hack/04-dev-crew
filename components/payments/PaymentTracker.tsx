"use client";

import { centsToCurrency } from "@/lib/utils";
import type { PaymentRecord } from "@/lib/types";

interface PaymentTrackerProps {
  payments: PaymentRecord[];
}

export function PaymentTracker({ payments }: PaymentTrackerProps) {
  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount_cents, 0);
  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + p.amount_cents, 0);

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <div className="hero-stats">
        <div className="stat-card">
          <strong style={{ color: "#15803d" }}>{centsToCurrency(totalPaid)}</strong>
          <span>Total Collected</span>
        </div>
        <div className="stat-card">
          <strong style={{ color: "#a16207" }}>{centsToCurrency(totalPending)}</strong>
          <span>Pending</span>
        </div>
        <div className="stat-card">
          <strong>{payments.length}</strong>
          <span>Transactions</span>
        </div>
      </div>

      {payments.length > 0 && (
        <div className="contact-card" style={{ padding: "1.5rem", overflowX: "auto" }}>
          <table style={{ width: "100%", textAlign: "left", fontSize: "0.9rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Payer</th>
                <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Type</th>
                <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Students</th>
                <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Amount</th>
                <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Method</th>
                <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Status</th>
                <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.5rem 0.75rem" }}>{p.payer_name}</td>
                  <td style={{ padding: "0.5rem 0.75rem", textTransform: "capitalize" }}>{p.payment_type}</td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>{p.student_count}</td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>{centsToCurrency(p.amount_cents)}</td>
                  <td style={{ padding: "0.5rem 0.75rem", textTransform: "capitalize" }}>{p.payment_method}</td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>
                    <span
                      className="badge"
                      style={{
                        background: p.status === "paid" ? "#dcfce7" : p.status === "pending" ? "#fef9c3" : "#fee2e2",
                        color: p.status === "paid" ? "#15803d" : p.status === "pending" ? "#a16207" : "#dc2626",
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "var(--muted)" }}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
