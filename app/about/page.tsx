const pillars = [
  {
    title: 'Mission',
    description:
      'Advance Action Learning worldwide by supporting coaches, chapters, and organizations applying the methodology in practice.',
  },
  {
    title: 'Global network',
    description:
      'WIAL operates through chapters and affiliates around the world, each serving local communities while staying connected to the global organization.',
  },
  {
    title: 'Founder and legacy',
    description:
      "WIAL builds on the Action Learning work of Reg Revans and the leadership of Dr. Michael Marquardt's global teaching and certification efforts.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">About WIAL</span>
          <h1 className="section-title">A global nonprofit advancing Action Learning.</h1>
          <p className="section-copy">
            The World Institute for Action Learning supports a worldwide network of
            certified coaches, chapters, and organizations using Action Learning to
            solve real challenges while developing leaders.
          </p>
        </div>
      </section>

      <div className="page-divider" />

      <section className="section">
        <div className="container card-grid">
          {pillars.map((pillar) => (
            <article className="feature-card" key={pillar.title}>
              <strong>{pillar.title}</strong>
              <p>{pillar.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container timeline-card">
          <strong>What this platform supports</strong>
          <p>
            The public site is the front door to a larger WIAL platform. It needs to
            communicate the organization clearly, support chapter growth, and prepare
            visitors for certification, coach discovery, and event participation.
          </p>
          <ul className="list-clean">
            <li>Clear explanation of WIAL and Action Learning</li>
            <li>Consistent structure across global and chapter pages</li>
            <li>Credible presentation for coaches, organizations, and prospective chapters</li>
          </ul>
        </div>
      </section>
    </>
  );
}
