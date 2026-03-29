"use client";

import { useEffect, useState } from "react";
import { useChapterDashboardContext } from "@/components/providers/ChapterDashboardProvider";
import CertBadge from "@/components/coaches/CertBadge";
import type { CoachRecord, CertificationLevel } from "@/lib/types";

const CERT_LEVELS: CertificationLevel[] = ["CALC", "PALC", "SALC", "MALC"];

const emptyForm = {
  full_name: "",
  contact_email: "",
  location_city: "",
  location_country: "",
  certification_level: "CALC" as CertificationLevel,
};

export default function ChapterCoachesPage() {
  const { chapterId } = useChapterDashboardContext();
  const [coaches, setCoaches] = useState<CoachRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLevel, setEditLevel] = useState<CertificationLevel>("CALC");
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (chapterId) load();
    else setLoading(false);
  }, [chapterId]);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/coaches?chapter_id=${chapterId}`);
    const json = await res.json();
    if (json.ok) {
      setCoaches((json.data as CoachRecord[]).filter((c) => c.chapter_id === chapterId));
    }
    setLoading(false);
  }

  const pending = coaches.filter((c) => !c.is_approved);
  const active = coaches.filter((c) => c.is_approved);

  async function approve(id: string) {
    setActing(id);
    await fetch(`/api/coaches/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: true }),
    });
    await load();
    setActing(null);
  }

  async function revoke(id: string) {
    setActing(id);
    await fetch(`/api/coaches/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: false }),
    });
    await load();
    setActing(null);
  }

  async function remove(id: string) {
    setActing(id);
    await fetch(`/api/coaches/${id}`, { method: "DELETE" });
    setRemoveConfirm(null);
    await load();
    setActing(null);
  }

  async function saveEditLevel(id: string) {
    setActing(id);
    await fetch(`/api/coaches/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ certification_level: editLevel }),
    });
    setEditingId(null);
    await load();
    setActing(null);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!chapterId) return;
    setAdding(true);
    setAddError(null);
    const res = await fetch("/api/coaches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, chapter_id: chapterId }),
    });
    const json = await res.json();
    if (!json.ok) {
      setAddError(json.error ?? "Failed to add coach.");
    } else {
      setForm(emptyForm);
      setShowAddForm(false);
      await load();
    }
    setAdding(false);
  }

  if (loading) return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading...</p>;
  if (!chapterId) return <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>No chapter assigned.</p>;

  return (
    <div style={{ display: "grid", gap: "2rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="section-title">Coach Management</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            {active.length} active · {pending.length} pending review
          </p>
        </div>
        <button
          type="button"
          className="button-primary"
          style={{ fontSize: "0.9rem" }}
          onClick={() => setShowAddForm((v) => !v)}
        >
          {showAddForm ? "Cancel" : "+ Add Coach"}
        </button>
      </div>

      {/* Add Coach Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="form-section">
          <h3>Add Coach Manually</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "1rem" }}>
            The coach will be added as pending and needs to be approved before appearing publicly.
          </p>
          <div className="form-grid-2">
            <div>
              <label className="form-label">Full Name *</label>
              <input
                className="form-input"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                placeholder="e.g. Jane Doe"
                required
              />
            </div>
            <div>
              <label className="form-label">Contact Email</label>
              <input
                className="form-input"
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className="form-label">City</label>
              <input
                className="form-input"
                value={form.location_city}
                onChange={(e) => setForm((f) => ({ ...f, location_city: e.target.value }))}
                placeholder="Lagos"
              />
            </div>
            <div>
              <label className="form-label">Country</label>
              <input
                className="form-input"
                value={form.location_country}
                onChange={(e) => setForm((f) => ({ ...f, location_country: e.target.value }))}
                placeholder="Nigeria"
              />
            </div>
            <div>
              <label className="form-label">Certification Level *</label>
              <select
                className="form-input"
                value={form.certification_level}
                onChange={(e) => setForm((f) => ({ ...f, certification_level: e.target.value as CertificationLevel }))}
              >
                {CERT_LEVELS.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
            </div>
          </div>
          {addError && <p className="form-error" style={{ marginTop: "0.75rem" }}>{addError}</p>}
          <div style={{ marginTop: "1rem" }}>
            <button
              type="submit"
              disabled={adding}
              className="button-primary"
              style={{ opacity: adding ? 0.65 : 1, cursor: adding ? "not-allowed" : "pointer", fontSize: "0.9rem" }}
            >
              {adding ? "Adding…" : "Add Coach"}
            </button>
          </div>
        </form>
      )}

      {/* Pending Section */}
      <section>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>Pending Review</h2>
          {pending.length > 0 && (
            <span style={{ background: "var(--brand)", color: "#fff", borderRadius: 999, fontSize: "0.72rem", fontWeight: 700, padding: "2px 9px" }}>
              {pending.length}
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="form-section" style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.9rem", padding: "1.5rem" }}>
            ✓ No coaches pending review.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {pending.map((coach) => (
              <CoachRow
                key={coach.id}
                coach={coach}
                acting={acting === coach.id}
                editingId={editingId}
                editLevel={editLevel}
                removeConfirm={removeConfirm}
                onApprove={() => approve(coach.id)}
                onRevoke={null}
                onRemoveClick={() => setRemoveConfirm(coach.id)}
                onRemoveConfirm={() => remove(coach.id)}
                onRemoveCancel={() => setRemoveConfirm(null)}
                onEditStart={() => { setEditingId(coach.id); setEditLevel(coach.certification_level); }}
                onEditCancel={() => setEditingId(null)}
                onEditSave={() => saveEditLevel(coach.id)}
                onEditLevelChange={(lvl) => setEditLevel(lvl)}
                isPending
              />
            ))}
          </div>
        )}
      </section>

      {/* Active Section */}
      <section>
        <h2 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 700 }}>
          Active Coaches
          <span style={{ marginLeft: 8, fontSize: "0.85rem", fontWeight: 400, color: "var(--muted)" }}>({active.length})</span>
        </h2>

        {active.length === 0 ? (
          <div className="form-section" style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.9rem", padding: "1.5rem" }}>
            No approved coaches yet. Approve a pending coach above.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {active.map((coach) => (
              <CoachRow
                key={coach.id}
                coach={coach}
                acting={acting === coach.id}
                editingId={editingId}
                editLevel={editLevel}
                removeConfirm={removeConfirm}
                onApprove={null}
                onRevoke={() => revoke(coach.id)}
                onRemoveClick={() => setRemoveConfirm(coach.id)}
                onRemoveConfirm={() => remove(coach.id)}
                onRemoveCancel={() => setRemoveConfirm(null)}
                onEditStart={() => { setEditingId(coach.id); setEditLevel(coach.certification_level); }}
                onEditCancel={() => setEditingId(null)}
                onEditSave={() => saveEditLevel(coach.id)}
                onEditLevelChange={(lvl) => setEditLevel(lvl)}
                isPending={false}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

interface CoachRowProps {
  coach: CoachRecord;
  acting: boolean;
  editingId: string | null;
  editLevel: CertificationLevel;
  removeConfirm: string | null;
  onApprove: (() => void) | null;
  onRevoke: (() => void) | null;
  onRemoveClick: () => void;
  onRemoveConfirm: () => void;
  onRemoveCancel: () => void;
  onEditStart: () => void;
  onEditCancel: () => void;
  onEditSave: () => void;
  onEditLevelChange: (lvl: CertificationLevel) => void;
  isPending: boolean;
}

function CoachRow({
  coach, acting, editingId, editLevel, removeConfirm,
  onApprove, onRevoke, onRemoveClick, onRemoveConfirm, onRemoveCancel,
  onEditStart, onEditCancel, onEditSave, onEditLevelChange, isPending,
}: CoachRowProps) {
  const initials = coach.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const isEditing = editingId === coach.id;
  const isConfirmingRemove = removeConfirm === coach.id;

  return (
    <div
      className="form-section"
      style={{
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
        borderLeft: isPending ? "3px solid var(--brand)" : "3px solid #15803d",
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, var(--accent), var(--brand))",
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}>
        {coach.photo_url
          ? <img src={coach.photo_url} alt={coach.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>{initials}</span>
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{coach.full_name}</span>

          {/* Cert level — editable inline */}
          {isEditing ? (
            <select
              className="form-input"
              style={{ width: "auto", padding: "2px 8px", fontSize: "0.82rem" }}
              value={editLevel}
              onChange={(e) => onEditLevelChange(e.target.value as CertificationLevel)}
            >
              {CERT_LEVELS.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
            </select>
          ) : (
            <CertBadge level={coach.certification_level} size="sm" />
          )}
        </div>
        <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
          {[coach.location_city, coach.location_country].filter(Boolean).join(", ")}
          {coach.contact_email && ` · ${coach.contact_email}`}
        </p>
      </div>

      {/* Remove confirm inline */}
      {isConfirmingRemove ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: "0.82rem", color: "#dc2626", fontWeight: 600 }}>Remove this coach?</span>
          <button
            onClick={onRemoveConfirm}
            disabled={acting}
            style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: "#dc2626", color: "#fff", fontWeight: 700, fontSize: "0.82rem", cursor: acting ? "not-allowed" : "pointer" }}
          >
            {acting ? "…" : "Yes, Remove"}
          </button>
          <button
            onClick={onRemoveCancel}
            style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      ) : isEditing ? (
        /* Edit mode actions */
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={onEditSave}
            disabled={acting}
            style={{ padding: "6px 14px", borderRadius: 7, border: "none", background: "#15803d", color: "#fff", fontWeight: 700, fontSize: "0.82rem", cursor: acting ? "not-allowed" : "pointer" }}
          >
            {acting ? "Saving…" : "Save"}
          </button>
          <button
            onClick={onEditCancel}
            style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      ) : (
        /* Normal actions */
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={onEditStart}
            style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
          >
            Edit Level
          </button>

          {onApprove && (
            <button
              onClick={onApprove}
              disabled={acting}
              style={{ padding: "6px 14px", borderRadius: 7, border: "none", background: acting ? "var(--muted)" : "#15803d", color: "#fff", fontWeight: 700, fontSize: "0.82rem", cursor: acting ? "not-allowed" : "pointer" }}
            >
              {acting ? "…" : "✓ Approve"}
            </button>
          )}

          {onRevoke && (
            <button
              onClick={onRevoke}
              disabled={acting}
              style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", fontWeight: 600, fontSize: "0.82rem", color: "var(--muted)", cursor: acting ? "not-allowed" : "pointer" }}
            >
              {acting ? "…" : "Revoke"}
            </button>
          )}

          <button
            onClick={onRemoveClick}
            style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid rgba(220,38,38,0.3)", background: "transparent", color: "#dc2626", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
