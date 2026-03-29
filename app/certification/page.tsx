const levels = [
  {
    name: 'CALC',
    description:
      'Entry-level Action Learning coach certification focused on structured training, practice, and foundational coaching skill development.',
  },
  {
    name: 'PALC',
    description:
      'Professional certification for coaches who continue building experience, documented coaching hours, and applied practice.',
  },
  {
    name: 'SALC',
    description:
      'Senior-level certification for experienced practitioners who often mentor, evaluate, and support advanced learning journeys.',
  },
  {
    name: 'MALC',
    description:
      'Master-level recognition for highly experienced leaders in Action Learning practice, teaching, and chapter development.',
  },
];

export default function CertificationPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">Certification</span>
          <h1 className="section-title">Four levels, one clear certification pathway.</h1>
          <p className="section-copy">
            WIAL certifications help coaches grow from foundational Action Learning
            practice to advanced professional leadership. This public page sets the
            stage for the deeper dashboard and LMS-connected workflows that come later.
          </p>
        </div>
      </section>

      <div className="page-divider" />

      <section className="section">
        <div className="container card-grid">
          {levels.map((level) => (
            <article className="feature-card" key={level.name}>
              <strong>{level.name}</strong>
              <p>{level.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container timeline-card">
          <strong>Important implementation note</strong>
          <p>
            The certification information belongs on the website, but the learning
            platform itself remains external. This project should explain the path and
            later surface status information without rebuilding the LMS.
          </p>
          <ul className="list-clean">
            <li>Public explanation of each certification level</li>
            <li>Links to external learning experiences in future slices</li>
            <li>Space for recertification guidance and requirements</li>
          </ul>
        </div>
      </section>
    </>
  );
}
