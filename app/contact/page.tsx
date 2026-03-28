export default function ContactPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">Contact</span>
          <h1 className="section-title">Reach WIAL through a simple, direct contact path.</h1>
          <p className="section-copy">
            The MVP requirement is intentionally light here: the public site can direct
            visitors to the Executive Director’s email while the richer workflows are
            still being built.
          </p>
        </div>
      </section>

      <div className="page-divider" />

      <section className="section">
        <div className="container contact-grid">
          <article className="contact-card">
            <strong>Executive Director</strong>
            <p>
              Primary contact for general WIAL inquiries, chapter questions, and
              certification-related direction during the MVP phase.
            </p>
            <p>
              Email:{' '}
              <a href="mailto:info@wial.org" style={{ color: 'var(--brand-dark)', fontWeight: 700 }}>
                info@wial.org
              </a>
            </p>
          </article>

          <article className="contact-card">
            <strong>What belongs here right now</strong>
            <p>
              A clear path to contact WIAL, lightweight public content, and no heavy
              form workflow yet. This keeps the public site simple while still meeting
              the MVP expectation from the spec.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
