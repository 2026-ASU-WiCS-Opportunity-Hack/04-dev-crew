import Link from 'next/link';

export default function EventsPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">Events</span>
          <h1 className="section-title">The events experience is coming next.</h1>
          <p className="section-copy">
            This placeholder keeps the route stable while the real global and
            chapter event calendar is still under construction.
          </p>
        </div>
      </section>

      <div className="page-divider" />

      <section className="section">
        <div className="container contact-card" style={{ padding: '2rem' }}>
          <strong>What will be added here</strong>
          <p>
            The completed version of this page will show global WIAL events,
            chapter-specific events, and eventually support RSVP or registration
            links as described in the spec.
          </p>
          <div className="stack-actions">
            <Link className="button-primary" href="/">
              Back to homepage
            </Link>
            <Link className="button-secondary" href="/resources">
              View resources
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
