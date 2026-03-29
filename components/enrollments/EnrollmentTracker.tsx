"use client";

interface Enrollment {
  id: string;
  company_name: string;
  company_code: string;
  total_licenses: number;
  used_licenses: number;
  contact_email: string | null;
  contact_name: string | null;
  created_at: string;
}

interface EnrollmentTrackerProps {
  enrollments: Enrollment[];
}

export function EnrollmentTracker({ enrollments }: EnrollmentTrackerProps) {
  if (enrollments.length === 0) {
    return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No enrollments yet.</p>;
  }

  return (
    <div className="contact-card" style={{ padding: "1.5rem", overflowX: "auto" }}>
      <table style={{ width: "100%", textAlign: "left", fontSize: "0.9rem", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Company</th>
            <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Code</th>
            <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Licenses</th>
            <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Used</th>
            <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Contact</th>
            <th style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>Created</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map((e) => (
            <tr key={e.id} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>{e.company_name}</td>
              <td style={{ padding: "0.5rem 0.75rem", fontFamily: "monospace", fontSize: "0.8rem" }}>{e.company_code}</td>
              <td style={{ padding: "0.5rem 0.75rem" }}>{e.total_licenses}</td>
              <td style={{ padding: "0.5rem 0.75rem" }}>
                <span style={{ color: e.used_licenses >= e.total_licenses ? "#dc2626" : "#15803d", fontWeight: 600 }}>
                  {e.used_licenses}
                </span>
              </td>
              <td style={{ padding: "0.5rem 0.75rem", color: "var(--muted)" }}>{e.contact_name ?? e.contact_email ?? "—"}</td>
              <td style={{ padding: "0.5rem 0.75rem", color: "var(--muted)" }}>
                {new Date(e.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
