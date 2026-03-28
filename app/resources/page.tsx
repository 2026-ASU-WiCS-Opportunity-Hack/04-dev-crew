const resources = [
  {
    title: 'Action Learning overview',
    description:
      'A public-facing introduction to the principles, language, and value of Action Learning.',
  },
  {
    title: 'Certification guidance',
    description:
      'Helpful references for understanding the pathway from CALC through MALC, including recertification context.',
  },
  {
    title: 'Chapter resources',
    description:
      'A future home for chapter-level materials, local resources, and reusable public-facing content blocks.',
  },
];

export default function ResourcesPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">Resources</span>
          <h1 className="section-title">A lightweight library page to anchor future content.</h1>
          <p className="section-copy">
            This page gives the public site a clear place for WIAL resources now, while
            leaving room for richer library, article, and research features later.
          </p>
        </div>
      </section>

      <div className="page-divider" />

      <section className="section">
        <div className="container resource-grid">
          {resources.map((resource) => (
            <article className="resource-card" key={resource.title}>
              <strong>{resource.title}</strong>
              <p>{resource.description}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
