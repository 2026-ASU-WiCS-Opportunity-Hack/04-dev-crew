import type { ChapterAccessDebugInfo } from "@/lib/chapter-access";

export function ChapterAccessDebug({
  info,
}: {
  info: ChapterAccessDebugInfo;
}) {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <section
      style={{
        marginBottom: "1rem",
        padding: "0.875rem 1rem",
        border: "1px dashed #f59e0b",
        borderRadius: "0.75rem",
        background: "#fff7ed",
        color: "#7c2d12",
        fontSize: "0.9rem",
      }}
    >
      <p style={{ margin: 0, fontWeight: 700 }}>Dev Debug: Chapter Access</p>
      <dl
        style={{
          margin: "0.75rem 0 0",
          display: "grid",
          gridTemplateColumns: "max-content 1fr",
          gap: "0.35rem 0.75rem",
        }}
      >
        <dt style={{ fontWeight: 600 }}>Email</dt>
        <dd style={{ margin: 0 }}>{info.email ?? "none"}</dd>
        <dt style={{ fontWeight: 600 }}>chapterId</dt>
        <dd style={{ margin: 0 }}>{info.chapterId ?? "none"}</dd>
        <dt style={{ fontWeight: 600 }}>chapterName</dt>
        <dd style={{ margin: 0 }}>{info.chapterName ?? "none"}</dd>
        <dt style={{ fontWeight: 600 }}>chapterSlug</dt>
        <dd style={{ margin: 0 }}>{info.chapterSlug ?? "none"}</dd>
        <dt style={{ fontWeight: 600 }}>role</dt>
        <dd style={{ margin: 0 }}>{info.role ?? "none"}</dd>
      </dl>
    </section>
  );
}
