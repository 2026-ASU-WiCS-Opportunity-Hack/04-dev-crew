import Link from 'next/link';

const methodologyCards = [
  {
    title: 'Critical Thinking',
    description:
      'Develop the capacity to analyze complex situations and ask the right questions under pressure.',
    accent: 'gold',
  },
  {
    title: 'Team Cohesion',
    description:
      'Transform a group of individuals into a high-performing team focused on collective success.',
    accent: 'blue',
  },
  {
    title: 'Reflective Learning',
    description:
      'Turn every real challenge into a learning loop that improves judgment, leadership, and action.',
    accent: 'gold',
  },
];

const advantages = [
  {
    title: 'Immediate Problem Resolution',
    description: 'Solve urgent organizational challenges while the learning happens.',
    icon: '✓',
    accent: 'rose',
  },
  {
    title: 'Exponential Leadership Growth',
    description: 'Develop soft skills and emotional intelligence through structured reflection.',
    icon: '↗',
    accent: 'gold',
  },
  {
    title: 'Globally Recognized Certification',
    description: 'WIAL certifications are the industry gold standard for Action Learning.',
    icon: '✦',
    accent: 'blue',
  },
];

const events = [
  {
    type: 'WEBINAR',
    date: 'April 10, 2026',
    title: 'Leading Through Questioning',
    description: 'A short introduction to Action Learning and the WIAL method.',
    imageBase: '/homepage-assets/optimized/pic-3',
  },
  {
    type: 'TRAINING',
    date: 'May 5, 2026',
    title: 'CALC Certification Track',
    description: 'Structured training for prospective certified Action Learning coaches.',
    imageBase: '/homepage-assets/optimized/picture-1',
  },
  {
    type: 'GLOBAL',
    date: 'June 15, 2026',
    title: 'Global AI Forum 2026',
    description: 'Connect with the worldwide WIAL network through conferences and events.',
    imageBase: '/homepage-assets/optimized/pic-2',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="container home-hero__grid">
          <div className="home-hero__copy animate-rise">
            <span className="eyebrow">Global authority</span>
            <h1 className="home-hero__title">
              Solve real problems. <span>Grow real leaders.</span>
            </h1>
            <p className="home-hero__text">
              WIAL helps organizations use Action Learning to build stronger teams,
              certify coaches, and create measurable change.
            </p>

            <div className="home-hero__actions">
              <Link className="button-primary" href="/certification">
                Get certified
              </Link>
              <Link className="button-secondary" href="/coaches">
                Find a coach
              </Link>
            </div>
          </div>

          <div className="home-hero__visual animate-rise animate-rise-delay-1">
            <div className="home-hero__image-wrap">
              <picture>
                <source srcSet="/homepage-assets/optimized/picture-1.avif" type="image/avif" />
                <source srcSet="/homepage-assets/optimized/picture-1.webp" type="image/webp" />
                <img
                  alt="Professionals meeting in a bright modern office"
                  className="home-hero__image"
                  decoding="async"
                  fetchPriority="high"
                  src="/homepage-assets/optimized/picture-1.jpeg"
                />
              </picture>
            </div>
            <div className="home-hero__overlay">
              <div className="authority-bar">
                <h3>Impact Driven</h3>
                <p>Built for coach development, business learning, and team transformation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <div className="timeline-card animate-rise">
            <strong>Mission statement</strong>
            <p>
              WIAL advances Action Learning worldwide by helping organizations solve
              urgent problems while developing leaders, coaches, and stronger teams.
            </p>
          </div>
        </div>
      </section>

      <section className="home-section section-tight">
        <div className="container home-method">
          <div className="home-method__intro animate-rise">
            <h2 className="home-heading">What is Action Learning?</h2>
            <p className="home-lead">
              A powerful problem-solving tool that simultaneously builds teams and
              develops leaders. It is especially effective for complex, urgent
              problems.
            </p>
            <Link className="home-link" href="/about">
              Learn the methodology
            </Link>
          </div>

          <div className="home-method__cards">
            {methodologyCards.map((card) => (
              <article className={`home-mini-card home-mini-card--${card.accent}`} key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section--soft">
        <div className="container home-bento animate-rise">
          <article className="home-bento__feature">
            <strong>40+</strong>
            <p>Global chapters delivering local impact through shared standards.</p>
          </article>
          <article className="home-bento__stat home-bento__stat--gold">
            <strong>15,000+</strong>
            <span>Certified coaches</span>
          </article>
          <article className="home-bento__stat home-bento__stat--red">
            <strong>90+</strong>
            <span>Member countries</span>
          </article>
          <article className="home-bento__network">
            <h3>Global network</h3>
            <p>Connected through one WIAL ecosystem for certification, visibility, and learning.</p>
          </article>
        </div>
      </section>

      <section className="home-section">
        <div className="container home-advantage">
          <div className="home-advantage__image animate-rise">
            <picture>
              <source srcSet="/homepage-assets/optimized/pic-2.avif" type="image/avif" />
              <source srcSet="/homepage-assets/optimized/pic-2.webp" type="image/webp" />
              <img
                alt="Collaborative workshop with participants using sticky notes"
                className="home-advantage__photo"
                decoding="async"
                loading="lazy"
                src="/homepage-assets/optimized/pic-2.jpeg"
              />
            </picture>
          </div>

          <div className="home-advantage__copy animate-rise animate-rise-delay-1">
            <span className="eyebrow">The WIAL advantage</span>
            <h2 className="home-heading">Why choose Action Learning?</h2>
            <ul className="home-advantage__list">
              {advantages.map((item) => (
                <li key={item.title}>
                  <span className={`home-advantage__icon home-advantage__icon--${item.accent}`}>
                    {item.icon}
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="home-section home-section--soft">
        <div className="container animate-rise">
          <div className="home-section__header">
            <div>
              <h2 className="home-heading">Featured events</h2>
              <p className="home-lead">Training, webinars, and global learning moments.</p>
            </div>
            <Link className="home-link" href="/events">
              View all events
            </Link>
          </div>

          <div className="home-events">
            {events.map((event) => (
              <article className="home-event-card" key={event.title}>
                <div className="home-event-card__media">
                  <picture>
                    <source srcSet={`${event.imageBase}.avif`} type="image/avif" />
                    <source srcSet={`${event.imageBase}.webp`} type="image/webp" />
                    <img
                      alt={event.title}
                      decoding="async"
                      loading="lazy"
                      src={`${event.imageBase}.jpeg`}
                    />
                  </picture>
                  <span>{event.type}</span>
                </div>
                <div className="home-event-card__body">
                  <p>{event.date}</p>
                  <h3>{event.title}</h3>
                  <div>{event.description}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container home-dual-cta animate-rise">
          <article className="home-dual-cta__card home-dual-cta__card--light">
            <h2>Become a Coach</h2>
            <p>
              Transform your career and your organization by becoming a Certified
              Action Learning Coach.
            </p>
            <Link className="button-primary" href="/certification">
              Certification Path
            </Link>
          </article>

          <article className="home-dual-cta__card home-dual-cta__card--bold">
            <h2>Find a Coach</h2>
            <p>
              Connect with an expert coach to solve your most pressing business
              challenges through Action Learning.
            </p>
            <Link className="button-secondary home-dual-cta__ghost" href="/coaches">
              Search Directory
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
