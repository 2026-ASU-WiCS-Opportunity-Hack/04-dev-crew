"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface BulkEnrollFormProps {
  chapterId: string;
  onCreated?: () => void;
}

export function BulkEnrollForm({ chapterId, onCreated }: BulkEnrollFormProps) {
  const [companyName, setCompanyName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [totalLicenses, setTotalLicenses] = useState(1);
  const [contactEmail, setContactEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName || !companyCode) return;

    setSaving(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { error: insertError } = await supabase.from("enrollments").insert({
        chapter_id: chapterId,
        company_name: companyName,
        company_code: companyCode.toUpperCase(),
        total_licenses: totalLicenses,
        contact_email: contactEmail || null,
        contact_name: contactName || null,
        created_by: user?.id ?? null,
      });

      if (insertError) throw insertError;

      setCompanyName("");
      setCompanyCode("");
      setTotalLicenses(1);
      setContactEmail("");
      setContactName("");
      onCreated?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create enrollment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form" style={{ gap: "1.25rem" }}>
      <div className="card-grid">
        <div className="contact-form__field-group">
          <label className="contact-form__label">Company Name <span>*</span></label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">Company Code <span>*</span></label>
          <input
            type="text"
            value={companyCode}
            onChange={(e) => setCompanyCode(e.target.value)}
            placeholder="ACME2026"
            required
            style={{ textTransform: "uppercase" }}
          />
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">Total Licenses <span>*</span></label>
          <input
            type="number"
            value={totalLicenses}
            onChange={(e) => setTotalLicenses(Math.max(1, parseInt(e.target.value, 10) || 1))}
            min={1}
          />
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">Contact Name</label>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
        </div>
        <div className="contact-form__field-group" style={{ gridColumn: "1 / -1" }}>
          <label className="contact-form__label">Contact Email</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>
      </div>

      {error && <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>{error}</p>}

      <button
        type="submit"
        disabled={saving || !companyName || !companyCode}
        className="button-primary"
        style={{ opacity: saving || !companyName || !companyCode ? 0.5 : 1 }}
      >
        {saving ? "Creating..." : "Create Enrollment"}
      </button>
    </form>
  );
}
