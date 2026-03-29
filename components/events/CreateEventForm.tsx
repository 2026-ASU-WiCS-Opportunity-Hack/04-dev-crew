"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface CreateEventFormProps {
  chapterId: string;
  onCreated?: () => void;
}

export function CreateEventForm({ chapterId, onCreated }: CreateEventFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [registrationLink, setRegistrationLink] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isGlobal, setIsGlobal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;

    setSaving(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: insertError } = await supabase.from("events").insert({
        chapter_id: chapterId,
        title,
        description: description || null,
        event_date: eventDate ? new Date(eventDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null,
        location: location || null,
        registration_link: registrationLink || null,
        capacity: capacity ? parseInt(capacity, 10) : null,
        is_global: isGlobal,
      });

      if (insertError) throw insertError;

      setTitle("");
      setDescription("");
      setEventDate("");
      setEndDate("");
      setLocation("");
      setRegistrationLink("");
      setCapacity("");
      setIsGlobal(false);
      onCreated?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form" style={{ gap: "1.25rem" }}>
      <div className="card-grid">
        <div className="contact-form__field-group" style={{ gridColumn: "1 / -1" }}>
          <label className="contact-form__label">Title <span>*</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="contact-form__field-group" style={{ gridColumn: "1 / -1" }}>
          <label className="contact-form__label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">Start Date</label>
          <input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">End Date</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="contact-form__field-group">
          <label className="contact-form__label">Capacity</label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            min={1}
          />
        </div>
        <div className="contact-form__field-group" style={{ gridColumn: "1 / -1" }}>
          <label className="contact-form__label">Registration Link</label>
          <input
            type="url"
            value={registrationLink}
            onChange={(e) => setRegistrationLink(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="checkbox"
            id="is-global"
            checked={isGlobal}
            onChange={(e) => setIsGlobal(e.target.checked)}
            style={{ width: "1rem", height: "1rem" }}
          />
          <label htmlFor="is-global" style={{ fontSize: "0.9rem", color: "var(--foreground)" }}>
            Global event (visible on /events)
          </label>
        </div>
      </div>

      {error && <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>{error}</p>}

      <button
        type="submit"
        disabled={saving || !title}
        className="button-primary"
        style={{ opacity: saving || !title ? 0.5 : 1 }}
      >
        {saving ? "Creating..." : "Create Event"}
      </button>
    </form>
  );
}
