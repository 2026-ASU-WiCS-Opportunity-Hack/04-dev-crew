"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Enrollment {
  id: string;
  company_name: string;
  company_code: string;
  total_licenses: number;
  used_licenses: number;
}

export default function EnrollPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>}>
      <EnrollPageInner />
    </Suspense>
  );
}

function EnrollPageInner() {
  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code") ?? "";

  const [code, setCode] = useState(codeParam);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (codeParam) lookupCode(codeParam);
  }, [codeParam]);

  async function lookupCode(c: string) {
    if (!c) return;
    setLoading(true);
    setError(null);
    setEnrollment(null);
    setSuccess(false);

    const supabase = createSupabaseBrowserClient();
    const { data, error: fetchErr } = await supabase
      .from("enrollments")
      .select("id, company_name, company_code, total_licenses, used_licenses")
      .eq("company_code", c.trim().toUpperCase())
      .single();

    if (fetchErr || !data) {
      setError("Invalid enrollment code. Please check and try again.");
    } else {
      const enrollment = data as Enrollment;
      if (enrollment.used_licenses >= enrollment.total_licenses) {
        setError("All licenses for this enrollment have been used.");
      } else {
        setEnrollment(enrollment);
      }
    }
    setLoading(false);
  }

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!enrollment || !attendeeName || !attendeeEmail) return;
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();

    const { error: updateErr } = await supabase
      .from("enrollments")
      .update({ used_licenses: enrollment.used_licenses + 1 })
      .eq("id", enrollment.id)
      .lt("used_licenses", enrollment.total_licenses);

    if (updateErr) {
      setError("Enrollment failed. The code may be fully used.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <>
      <section className="page-header">
        <div className="container" style={{ maxWidth: "480px" }}>
          <span className="eyebrow">Enrollment</span>
          <h1 className="section-title">Enroll</h1>
          <p className="section-copy">
            Enter your company enrollment code to register.
          </p>
        </div>
      </section>
      <div className="page-divider" />
      <section className="section">
        <div className="container" style={{ maxWidth: "480px" }}>

      {success ? (
        <div className="feature-card" style={{ textAlign: "center", borderLeft: "4px solid #15803d" }}>
          <p style={{ fontSize: "1.15rem", fontWeight: 600, color: "#15803d" }}>Enrolled successfully!</p>
          <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginTop: "0.25rem" }}>
            Welcome, {attendeeName}. You have been enrolled under{" "}
            <strong>{enrollment?.company_name}</strong>.
          </p>
        </div>
      ) : (
        <>
          {!enrollment && (
            <div className="contact-form" style={{ gap: "0.75rem" }}>
              <label className="contact-form__label">
                Company Enrollment Code
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ACME2025"
                  style={{ textTransform: "uppercase", flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => lookupCode(code)}
                  disabled={loading || !code}
                  className="button-primary"
                  style={{ whiteSpace: "nowrap", opacity: loading || !code ? 0.5 : 1 }}
                >
                  {loading ? "Checking..." : "Look Up"}
                </button>
              </div>
            </div>
          )}

          {enrollment && (
            <form onSubmit={handleEnroll} className="contact-form" style={{ gap: "1rem" }}>
              <div className="feature-card">
                <p style={{ fontWeight: 600, color: "var(--foreground)" }}>{enrollment.company_name}</p>
                <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                  {enrollment.used_licenses} / {enrollment.total_licenses} licenses used
                </p>
              </div>

              <div className="contact-form__field-group">
                <label className="contact-form__label">Your Name <span>*</span></label>
                <input
                  type="text"
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  required
                />
              </div>
              <div className="contact-form__field-group">
                <label className="contact-form__label">Your Email <span>*</span></label>
                <input
                  type="email"
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="button-primary"
                style={{ width: "100%", opacity: loading ? 0.5 : 1 }}
              >
                {loading ? "Enrolling..." : "Complete Enrollment"}
              </button>
            </form>
          )}

          {error && (
            <p style={{ marginTop: "1rem", color: "#dc2626", fontSize: "0.9rem" }}>{error}</p>
          )}
        </>
      )}

        </div>
      </section>
    </>
  );
}
