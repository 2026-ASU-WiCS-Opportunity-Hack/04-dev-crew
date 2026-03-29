"use client";

interface TestimonialCardProps {
  testimonial: {
    quote_text: string;
    author_name: string;
    author_title: string | null;
    organization: string | null;
    video_url: string | null;
  };
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <blockquote className="feature-card">
      <p style={{ fontStyle: "italic", lineHeight: 1.7 }}>&ldquo;{testimonial.quote_text}&rdquo;</p>
      <footer style={{ marginTop: "0.7rem", color: "var(--muted)", fontSize: "0.9rem" }}>
        — {testimonial.author_name}
        {testimonial.author_title && `, ${testimonial.author_title}`}
        {testimonial.organization && ` at ${testimonial.organization}`}
      </footer>
      {testimonial.video_url && (
        <a
          href={testimonial.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="home-link"
          style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}
        >
          Watch video &rarr;
        </a>
      )}
    </blockquote>
  );
}
