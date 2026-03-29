const levels = [
  {
    code: "CALC",
    title: "Certified Action Learning Coach",
    summary: "Entry level for coaches leading Action Learning sessions.",
    requirement: "32+ hours of training",
  },
  {
    code: "PALC",
    title: "Professional Action Learning Coach",
    summary: "For coaches with proven practice and deeper experience.",
    requirement: "100+ coaching hours",
  },
  {
    code: "SALC",
    title: "Senior Action Learning Coach",
    summary: "For experienced practitioners cleared to lead WIAL programs.",
    requirement: "Can train and mentor others",
  },
  {
    code: "MALC",
    title: "Master Action Learning Coach",
    summary: "Top-tier recognition for thought leadership in Action Learning.",
    requirement: "Highest level of achievement",
  },
] as const;

const badgeHighlights = [
  "Easy to share online",
  "Recognized by clients and employers",
  "Shows award and expiration dates",
  "Verified through the official provider",
] as const;

export default function CertificationPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">Certification</span>
          <h1 className="section-title">WIAL certification, clearly explained.</h1>
          <p className="section-copy">
            WIAL offers four certification levels for Action Learning coaches, from
            entry-level practice to master-level recognition.
          </p>
        </div>
      </section>

      <div className="page-divider" />

      <section className="section">
        <div className="container certification-intro">
          <article className="timeline-card">
            <strong>Why get certified?</strong>
            <p>
              Organizations increasingly want trained Action Learning coaches.
              Certification gives coaches more credibility and gives clients more
              confidence.
            </p>
            <ul className="list-clean">
              <li>Build trust with organizations</li>
              <li>Show progression through four levels</li>
              <li>Strengthen your professional profile</li>
            </ul>
          </article>

          <article className="timeline-card certification-note">
            <strong>ICF-accredited training provider</strong>
            <p>
              WIAL is an ICF-accredited training provider, and the CALC program is
              recognized as an accredited ICF CCE offering.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="home-section__header">
            <div>
              <h2 className="home-heading">Four levels of certification</h2>
              <p className="home-lead">
                A simple pathway from foundational coaching to advanced leadership.
              </p>
            </div>
          </div>

          <div className="card-grid certification-grid">
            {levels.map((level) => (
              <article className="feature-card certification-card" key={level.code}>
                <span className={`cert-badge cert-badge--${level.code} cert-badge--lg`}>
                  {level.code}
                </span>
                <strong>{level.title}</strong>
                <p>{level.summary}</p>
                <div className="certification-card__meta">{level.requirement}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container certification-badges-shell">
          <div className="home-section__header">
            <div>
              <h2 className="home-heading">Digital badges</h2>
              <p className="home-lead">
                Every certification can also be shared as a verified digital badge.
              </p>
            </div>
          </div>

          <div className="badge-row certification-badges">
            {levels.map((level) => (
              <span className={`cert-badge cert-badge--${level.code}`} key={level.code}>
                {level.code} badge
              </span>
            ))}
          </div>

          <div className="certification-badge-copy">
            <p>
              A digital badge helps certified coaches share their achievement on
              professional profiles, websites, and email signatures.
            </p>
            <ul className="list-clean">
              {badgeHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
