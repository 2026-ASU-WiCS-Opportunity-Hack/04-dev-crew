import Link from "next/link";

type UnauthorizedPageProps = {
  searchParams?: {
    reason?: string;
  };
};

const reasonCopy: Record<string, { title: string; body: string }> = {
  "no-profile": {
    title: "Profile setup incomplete",
    body:
      "Your account is signed in, but it does not have an application role yet. Please contact an administrator.",
  },
  "no-coach-profile": {
    title: "Coach profile required",
    body:
      "Your account is signed in as a coach, but the linked coach profile could not be found.",
  },
  "no-chapter": {
    title: "No chapter access found",
    body:
      "Your account does not have an assigned chapter yet, so this chapter page is unavailable right now.",
  },
  default: {
    title: "Access unavailable",
    body:
      "You do not currently have access to this chapter page. If you believe this is a mistake, please contact an administrator.",
  },
};

export default function UnauthorizedPage({
  searchParams,
}: UnauthorizedPageProps) {
  const reason = searchParams?.reason ?? "default";
  const copy = reasonCopy[reason] ?? reasonCopy.default;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
      }}
    >
      <section
        className="feature-card"
        style={{
          width: "min(100%, 42rem)",
          padding: "2rem",
          display: "grid",
          gap: "1rem",
        }}
      >
        <span className="eyebrow">Access Notice</span>
        <h1 className="section-title" style={{ margin: 0 }}>
          {copy.title}
        </h1>
        <p className="section-copy" style={{ margin: 0 }}>
          {copy.body}
        </p>
        <div className="stack-actions" style={{ marginTop: "0.5rem" }}>
          <Link href="/" className="button-primary">
            Return Home
          </Link>
          <Link href="/dashboard/chapter" className="button-secondary">
            Go to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
