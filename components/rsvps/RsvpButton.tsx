"use client";

import { useState } from "react";

interface RsvpButtonProps {
  eventId: string;
}

export function RsvpButton({ eventId }: RsvpButtonProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rsvps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, attendee_name: name, attendee_email: email }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "RSVP failed");
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "RSVP failed");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#15803d" }}>
        You&apos;re registered! We&apos;ll see you there.
      </p>
    );
  }

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="button-primary"
      >
        RSVP
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "0.5rem" }}>
      <div className="contact-form__field-group" style={{ flex: "1 1 auto", minWidth: "120px" }}>
        <label className="contact-form__label" style={{ fontSize: "0.75rem" }}>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="contact-form__field-group" style={{ flex: "1 1 auto", minWidth: "120px" }}>
        <label className="contact-form__label" style={{ fontSize: "0.75rem" }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="button-primary"
        style={{ opacity: loading ? 0.5 : 1 }}
      >
        {loading ? "..." : "Confirm"}
      </button>
      {error && <p style={{ width: "100%", color: "#dc2626", fontSize: "0.8rem" }}>{error}</p>}
    </form>
  );
}
