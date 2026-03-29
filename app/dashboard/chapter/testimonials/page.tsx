"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";

interface Testimonial {
  id: string;
  quote_text: string;
  author_name: string;
  author_title: string | null;
  organization: string | null;
  video_url: string | null;
  created_at: string;
}

export default function ChapterTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorTitle, setAuthorTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("chapter_id")
      .eq("id", user.id)
      .single();

    const cid = (profile as { chapter_id: string | null } | null)?.chapter_id ?? null;
    setChapterId(cid);

    if (cid) {
      const { data } = await supabase
        .from("testimonials")
        .select("*")
        .eq("chapter_id", cid)
        .order("created_at", { ascending: false });
      setTestimonials((data as Testimonial[]) ?? []);
    }
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!quoteText || !authorName || !chapterId) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.from("testimonials").insert({
      chapter_id: chapterId,
      quote_text: quoteText,
      author_name: authorName,
      author_title: authorTitle || null,
      organization: organization || null,
    });
    setQuoteText("");
    setAuthorName("");
    setAuthorTitle("");
    setOrganization("");
    setShowForm(false);
    setSaving(false);
    await loadData();
  }

  if (loading) return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading...</p>;
  if (!chapterId) return <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>No chapter assigned.</p>;

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 className="section-title">Testimonials</h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="button-primary"
        >
          {showForm ? "Cancel" : "Add Testimonial"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="contact-form" style={{ padding: "1.5rem" }}>
          <div className="contact-form__field-group">
            <label className="contact-form__label">Quote *</label>
            <textarea value={quoteText} onChange={(e) => setQuoteText(e.target.value)} required rows={3} className="contact-form__field" />
          </div>
          <div className="card-grid">
            <div className="contact-form__field-group">
              <label className="contact-form__label">Author Name *</label>
              <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required className="contact-form__field" />
            </div>
            <div className="contact-form__field-group">
              <label className="contact-form__label">Title</label>
              <input type="text" value={authorTitle} onChange={(e) => setAuthorTitle(e.target.value)} className="contact-form__field" />
            </div>
            <div className="contact-form__field-group">
              <label className="contact-form__label">Organization</label>
              <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} className="contact-form__field" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="button-primary" style={{ opacity: saving ? 0.5 : 1 }}>
            {saving ? "Saving..." : "Add Testimonial"}
          </button>
        </form>
      )}

      {testimonials.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No testimonials yet.</p>
      ) : (
        <div className="card-grid">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      )}
    </div>
  );
}
