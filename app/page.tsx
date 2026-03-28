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

const benefits = [
  {
    title: 'Solves urgent problems',
    description:
      'Action Learning is particularly effective for complex challenges that may look unsolvable at first.',
  },
  {
    title: 'Develops leaders at the same time',
    description:
      'Its simple rules push participants to think critically, listen carefully, and work collaboratively.',
  },
  {
    title: 'Strengthens how groups work',
    description:
      'It elevates the norms, creativity, courage, and collaboration of teams working through hard decisions.',
  },
];

const components = [
  'A problem that is urgent, significant, and owned by the group',
  'An Action Learning group or team',
  'A process of insightful questioning and reflective listening',
  'An action taken on the problem',
  'A commitment to learning',
  'An Action Learning coach',
];

const organizationPillars = [
  {
    title: 'Global nonprofit network',
    description:
      'WIAL operates through chapters and affiliates around the world while maintaining shared standards and a common public identity.',
  },
  {
    title: 'Leading certifying body',
    description:
      'WIAL is positioned as the world’s leading certifying body for Action Learning coaches and leadership development programs.',
  },
  {
    title: 'Practical application',
    description:
      'The organization supports real-world problem solving, coach development, and applied learning across business, government, healthcare, and education.',
  },
];

const audiences = [
  {
    title: 'Individuals',
    description:
      'Build the ability to ask stronger questions, listen reflectively, and lead groups through difficult problems with confidence.',
  },
  {
    title: 'Teams',
    description:
      'Improve dialogue, trust, and decision making while working on meaningful issues that require collaborative thinking.',
  },
  {
    title: 'Organizations',
    description:
      'Enhance business performance by creating a repeatable way to solve complex challenges and develop leaders at the same time.',
  },
];

const eventsPreview = [
  {
    title: 'WIAL Global Conference',
    description:
      'A flagship gathering for coaches, practitioners, and chapter leaders to connect around Action Learning practice.',
  },
  {
    title: 'Certification cohorts',
    description:
      'Upcoming chapter-led and virtual learning opportunities designed to move prospective coaches toward certification.',
  },
  {
    title: 'Webinars and talks',
    description:
      'Shorter public learning moments that introduce Action Learning and keep the community engaged year-round.',
  },
];

const resourcesPreview = [
  {
    title: 'WIAL Talk and articles',
    description:
      'Thought leadership, educational content, and practical writing that helps visitors understand the method more clearly.',
  },
  {
    title: 'Action Learning brochure',
    description:
      'A concise overview of WIAL and the Action Learning approach for people exploring the method for the first time.',
  },
  {
    title: 'Programs and learning resources',
    description:
      'A growing library of materials for prospective coaches, organizations, and chapter communities.',
  },
];

const testimonials = [
  {
    quote:
      'Action Learning transformed how our leadership team approaches complex problems and helped us build stronger collaboration at the same time.',
    attribution: 'Leadership team client perspective',
  },
  {
    quote:
      'WIAL certification gave me a structure I now use every day with teams facing ambiguity, change, and high-stakes decisions.',
    attribution: 'Certified coach perspective',
  },
];

const stats = [
  { label: 'Chapter sites', value: '20+' },
  { label: 'Certification levels', value: '4' },
  { label: 'Public pages', value: '5' },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">Action learning</span>
            <h1 className="section-title">
              What is Action Learning?
            </h1>
            <p className="section-copy">
              Action Learning is a process that involves a small group working on
              real problems, taking action, and learning as individuals, as a team,
              and as an organization. It helps organizations develop creative,
              flexible, and successful strategies to pressing problems.
            </p>

            <div className="hero-actions">
              <Link className="button-primary" href="/certification">
                Become certified
              </Link>
              <Link className="button-secondary" href="/coaches">
                Find a coach
              </Link>
            </div>

            <div className="badge-row" aria-label="Platform themes">
              <span className="badge">Problem solving</span>
              <span className="badge">Leadership development</span>
              <span className="badge">Reflective learning</span>
            </div>
          </div>

          <div className="hero-panel">
            <strong>Why organizations use it</strong>
            <p>
              Action Learning generates a new way of problem solving and action
              taking in the business sphere. It helps individuals, teams, and
              organizations improve performance while working on real issues.
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
          <span className="eyebrow">About WIAL</span>
          <h2 className="section-title">The World Institute for Action Learning is the global home of the practice.</h2>
          <p className="section-copy">
            WIAL brings together certification, chapter leadership, and a worldwide
            community of coaches committed to solving real problems through Action
            Learning.
          </p>

          <div className="card-grid" style={{ marginTop: '1.75rem' }}>
            {organizationPillars.map((item) => (
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
          <span className="eyebrow">Why it works</span>
          <h2 className="section-title">Action Learning solves problems and develops leaders simultaneously.</h2>
          <p className="section-copy">
            Its simple rules force participants to think critically and work
            collaboratively. The Action Learning coach helps the group reflect on
            how it is functioning, not just on solving the problem itself.
          </p>

          <div className="card-grid" style={{ marginTop: '1.75rem' }}>
            {benefits.map((item) => (
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
          <span className="eyebrow">Core components</span>
          <h2 className="section-title">Action Learning is built on six essential components.</h2>
          <p className="section-copy">
            The process begins with the right problem and the right group, then
            moves through disciplined questioning, action, and learning.
          </p>

          <div className="chapter-grid" style={{ marginTop: '1.75rem' }}>
            {components.map((component) => (
              <article className="chapter-card" key={component}>
                <strong>{component}</strong>
                <p>
                  This element is part of the WIAL methodology and helps teams move
                  from discussion to action while building stronger group learning.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="eyebrow">WIAL solution spheres</span>
          <h2 className="section-title">WIAL helps unlock the full potential of Action Learning.</h2>
          <p className="section-copy">
            WIAL Action Learning empowers individuals, teams, and organizations. It
            enhances business and organizational performance by turning reflective
            problem solving into a repeatable practice.
          </p>

          <div className="card-grid" style={{ marginTop: '1.75rem' }}>
            {audiences.map((audience) => (
              <article className="feature-card" key={audience.title}>
                <strong>{audience.title}</strong>
                <p>{audience.description}</p>
              </article>
            ))}
          </div>

          <div className="chapter-grid" style={{ marginTop: '1.75rem' }}>
            {chapters.map((chapter) => (
              <article className="chapter-card" key={chapter.name}>
                <strong>{chapter.name}</strong>
                <p>{chapter.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container contact-card" style={{ padding: '2rem' }}>
          <span className="eyebrow">Events</span>
          <h2 className="section-title">From conferences to chapter programs, WIAL is an active learning community.</h2>
          <p className="section-copy">
            The homepage should point visitors toward upcoming ways to engage,
            whether they are exploring certification, joining a webinar, or looking
            for chapter-hosted learning opportunities.
          </p>

          <div className="card-grid" style={{ marginTop: '1.75rem' }}>
            {eventsPreview.map((item) => (
              <article className="feature-card" key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>

          <div className="stack-actions">
            <Link className="button-secondary" href="/events">
              View events
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="eyebrow">Resources</span>
          <h2 className="section-title">Visitors should be able to keep learning after the first click.</h2>
          <p className="section-copy">
            WIAL’s public experience should connect people to useful resources,
            educational content, and practical material that helps them understand
            Action Learning in more depth.
          </p>

          <div className="resource-grid" style={{ marginTop: '1.75rem' }}>
            {resourcesPreview.map((item) => (
              <article className="resource-card" key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>

          <div className="stack-actions">
            <Link className="button-secondary" href="/resources">
              Browse resources
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="eyebrow">Impact</span>
          <h2 className="section-title">The homepage should also give visitors confidence in the value of the method.</h2>
          <p className="section-copy">
            Social proof helps new visitors understand that WIAL is not only a
            methodology, but a credible partner for leadership development and
            organizational problem solving.
          </p>

          <div className="card-grid" style={{ marginTop: '1.75rem' }}>
            {testimonials.map((item) => (
              <article className="feature-card" key={item.attribution}>
                <strong>{item.attribution}</strong>
                <p>{item.quote}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container contact-card" style={{ padding: '2rem' }}>
          <span className="eyebrow">Take the next step</span>
          <h2 className="section-title">Interested in certification or looking for a coach?</h2>
          <p className="section-copy">
            WIAL is the world’s leading certifying body for Action Learning. Whether
            you want to become a certified Action Learning coach or find one for your
            organization, this platform is designed to guide you there.
          </p>
          <div className="stack-actions">
            <Link className="button-primary" href="/certification">
              Explore certification
            </Link>
            <Link className="button-secondary" href="/coaches">
              Search for coaches
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
