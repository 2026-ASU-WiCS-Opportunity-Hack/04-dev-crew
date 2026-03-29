"use client";

import { useEffect, useState } from "react";

import { ClientGrid } from "@/components/clients/ClientGrid";
import { useChapterDashboardContext } from "@/components/providers/ChapterDashboardProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Client {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
}

export default function ChapterClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const { chapterId } = useChapterDashboardContext();

  useEffect(() => {
    if (!chapterId) {
      setLoading(false);
      return;
    }

    loadData(chapterId);
  }, [chapterId]);

  async function loadData(currentChapterId: string) {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("chapter_id", currentChapterId)
      .order("name");
    setClients((data as Client[]) ?? []);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !chapterId) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.from("clients").insert({
      chapter_id: chapterId,
      name,
      website_url: websiteUrl || null,
      description: description || null,
    });
    setName("");
    setWebsiteUrl("");
    setDescription("");
    setShowForm(false);
    setSaving(false);
    await loadData(chapterId);
  }

  if (loading) return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading...</p>;
  if (!chapterId) return <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>No chapter assigned.</p>;

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 className="section-title">Client Organizations</h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="button-primary"
        >
          {showForm ? "Cancel" : "Add Client"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="contact-form" style={{ padding: "1.5rem" }}>
          <div className="contact-form__field-group">
            <label className="contact-form__label">Organization Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="contact-form__field" />
          </div>
          <div className="contact-form__field-group">
            <label className="contact-form__label">Website URL</label>
            <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="contact-form__field" />
          </div>
          <div className="contact-form__field-group">
            <label className="contact-form__label">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="contact-form__field" />
          </div>
          <button type="submit" disabled={saving} className="button-primary" style={{ opacity: saving ? 0.5 : 1 }}>
            {saving ? "Saving..." : "Add Client"}
          </button>
        </form>
      )}

      <ClientGrid clients={clients} />
    </div>
  );
}
