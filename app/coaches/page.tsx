import Link from 'next/link';

export default function CoachesPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">Coach Directory</span>
          <h1 className="section-title">The global coach directory is coming next.</h1>
          <p className="section-copy">
            This placeholder keeps the route stable while the real coach search,
            filters, approval logic, and profile cards are being implemented.
          </p>
        </div>
      </section>

      <div className="page-divider" />

      <section className="section">
        <div className="container contact-card" style={{ padding: '2rem' }}>
          <strong>What will land here</strong>
          <p>
            The full version of this page will show approved coaches from across WIAL
            chapters, support filtering by certification and location, and later
            connect to the AI-powered multilingual search flow in the spec.
          </p>
          <div className="stack-actions">
            <Link className="button-primary" href="/">
              Back to homepage
            </Link>
            <Link className="button-secondary" href="/about">
              Learn about WIAL
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
