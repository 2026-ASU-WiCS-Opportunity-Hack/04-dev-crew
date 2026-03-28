import Link from 'next/link';

const chapters = [
  {
    name: 'WIAL USA',
    description:
      'Leadership development, certification programs, and chapter programming for coaches across the United States.',
  },
  {
    name: 'WIAL Nigeria',
    description:
      'A regional chapter designed for strong visibility, lighter pages, and better support for local coaching communities.',
  },
  {
    name: 'WIAL Brazil',
    description:
      'A multilingual-ready chapter experience with local events, resources, and culturally adapted chapter content.',
  },
];

const highlights = [
  {
    title: 'One global platform',
    description:
      'Shared branding, shared standards, and one place to manage public content across chapters.',
  },
  {
    title: 'Discoverable coaches',
    description:
      'A global directory that helps organizations find WIAL-certified coaches with the right experience and location.',
  },
  {
    title: 'Built for low bandwidth',
    description:
      'Static-first pages, system fonts, and lightweight design choices that support slower networks.',
  },
];

const stats = [
  { label: 'Chapter-ready structure', value: '20+' },
  { label: 'Certification levels', value: '4' },
  { label: 'Public pages in this slice', value: '5' },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Unified global platform</span>
            <h1 className="section-title">
              A modern public home for WIAL chapters, coaches, and Action Learning.
            </h1>
            <p className="section-copy">
              This first frontend slice establishes the shared shell for the WIAL
              platform: a clear public-facing homepage, strong navigation, and a
              structure the chapter, coach, and dashboard experiences can build on.
            </p>

            <div className="hero-actions">
              <Link className="button-primary" href="/about">
                Explore the mission
              </Link>
              <Link className="button-secondary" href="/certification">
                View certification paths
              </Link>
            </div>

            <div className="badge-row" aria-label="Platform themes">
              <span className="badge">Global chapter network</span>
              <span className="badge">Consistent public experience</span>
              <span className="badge">Static-first foundation</span>
            </div>
          </div>

          <div className="hero-panel">
            <strong>What this foundation needs to do</strong>
            <p>
              Give the team a public shell that is clear enough for judges,
              structured enough for future chapter routing, and lightweight enough
              to respect the performance goals in the specification.
            </p>

            <div className="hero-stats section-tight">
              {stats.map((stat) => (
                <div className="stat-card" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="eyebrow">Why this platform</span>
          <h2 className="section-title">The website has to work for a global network, not one office.</h2>
          <p className="section-copy">
            WIAL needs a public presence that supports chapter independence without
            losing global identity. The platform has to make chapters look credible,
            help coaches become visible, and stay fast on slower connections.
          </p>

          <div className="card-grid" style={{ marginTop: '1.75rem' }}>
            {highlights.map((item) => (
              <article className="feature-card" key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="eyebrow">Chapter examples</span>
          <h2 className="section-title">A shared look with space for local identity.</h2>
          <p className="section-copy">
            Chapters will eventually live under one platform, but each one still
            needs room to feature local events, coaches, testimonials, and market
            context.
          </p>

          <div className="chapter-grid" style={{ marginTop: '1.75rem' }}>
            {chapters.map((chapter) => (
              <article className="chapter-card" key={chapter.name}>
                <strong>{chapter.name}</strong>
                <p>{chapter.description}</p>
                <Link className="button-text" href="/about">
                  Learn more
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container contact-card" style={{ padding: '2rem' }}>
          <span className="eyebrow">Next steps</span>
          <h2 className="section-title">This shell is the base for chapters, coaches, and dashboards.</h2>
          <p className="section-copy">
            After the public shell is in place, the next implementation layers can
            focus on the coach directory, chapter pages, admin dashboards, and
            payment workflows without reinventing the public experience.
          </p>
          <div className="stack-actions">
            <Link className="button-primary" href="/coaches">
              Coach directory route
            </Link>
            <Link className="button-secondary" href="/contact">
              Contact WIAL
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
