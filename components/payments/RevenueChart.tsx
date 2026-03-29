"use client";

import { centsToCurrency } from "@/lib/utils";

interface ChapterRevenue {
  chapterName: string;
  totalCents: number;
  paidCents: number;
  pendingCents: number;
  overdueCount: number;
}

interface RevenueChartProps {
  data: ChapterRevenue[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const maxCents = Math.max(...data.map((d) => d.totalCents), 1);

  if (data.length === 0) {
    return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No revenue data available.</p>;
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {data.map((d) => {
        const paidPct = Math.round((d.paidCents / maxCents) * 100);
        const pendingPct = Math.round(((d.totalCents - d.paidCents) / maxCents) * 100);
        return (
          <div key={d.chapterName}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.3rem" }}>
              <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--foreground)" }}>{d.chapterName}</span>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{centsToCurrency(d.totalCents)}</span>
            </div>
            <div
              style={{
                display: "flex",
                height: "1.25rem",
                borderRadius: "0.5rem",
                overflow: "hidden",
                background: "var(--surface-muted)",
              }}
            >
              {paidPct > 0 && (
                <div
                  style={{
                    width: `${paidPct}%`,
                    background: "#15803d",
                    transition: "width 0.4s ease",
                  }}
                  title={`Paid: ${centsToCurrency(d.paidCents)}`}
                />
              )}
              {pendingPct > 0 && (
                <div
                  style={{
                    width: `${pendingPct}%`,
                    background: "#facc15",
                    transition: "width 0.4s ease",
                  }}
                  title={`Pending: ${centsToCurrency(d.totalCents - d.paidCents)}`}
                />
              )}
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.2rem", fontSize: "0.75rem", color: "var(--muted)" }}>
              <span>Paid: {centsToCurrency(d.paidCents)}</span>
              <span>Pending: {centsToCurrency(d.pendingCents)}</span>
              {d.overdueCount > 0 && (
                <span style={{ color: "#dc2626" }}>{d.overdueCount} overdue</span>
              )}
            </div>
          </div>
        );
      })}
      {/* Legend */}
      <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.5rem" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <span style={{ width: "0.75rem", height: "0.75rem", borderRadius: "2px", background: "#15803d", display: "inline-block" }} />
          Paid
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <span style={{ width: "0.75rem", height: "0.75rem", borderRadius: "2px", background: "#facc15", display: "inline-block" }} />
          Pending/Overdue
        </span>
      </div>
    </div>
  );
}
