'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, country, topic, message }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? 'Failed to send message.');
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="contact-page">
        <div className="container contact-page__grid">
          <section className="contact-form-card">
            <div className="contact-form-card__intro">
              <h1>CONTACT US!</h1>
              <p>
                We are here to help! Please reach out if you have any questions or
                want more information on our company, services, or Action Learning.
              </p>
            </div>

            {submitted ? (
              <p style={{ fontWeight: 600, color: '#15803d', fontSize: '1rem', marginTop: '1.5rem' }}>
                Thank you! Your message has been received. We&apos;ll be in touch shortly.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-form__field-group">
                  <label className="contact-form__label" htmlFor="first-name">
                    Name <span>*</span>
                  </label>
                  <div className="contact-form__name-row">
                    <div className="contact-form__field">
                      <input
                        id="first-name"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                      <small>First</small>
                    </div>
                    <div className="contact-form__field">
                      <input
                        id="last-name"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                      <small>Last</small>
                    </div>
                  </div>
                </div>

                <div className="contact-form__field-group">
                  <label className="contact-form__label" htmlFor="email">
                    E-mail <span>*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="contact-form__field-group">
                  <label className="contact-form__label" htmlFor="country">
                    Country <span>*</span>
                  </label>
                  <input
                    id="country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>

                <div className="contact-form__field-group">
                  <label className="contact-form__label" htmlFor="about">
                    About <span>*</span>
                  </label>
                  <select
                    id="about"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  >
                    <option disabled value="">
                      Choose
                    </option>
                    <option>Certification</option>
                    <option>Find a Coach</option>
                    <option>Programs</option>
                    <option>Resources</option>
                    <option>General Question</option>
                  </select>
                </div>

                <div className="contact-form__field-group">
                  <label className="contact-form__label" htmlFor="comment">
                    Comment or Question <span>*</span>
                  </label>
                  <textarea
                    id="comment"
                    rows={8}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <p style={{ color: '#dc2626', fontSize: '0.9rem' }}>{error}</p>
                )}

                <button
                  className="contact-form__submit"
                  type="submit"
                  disabled={submitting}
                  style={{ opacity: submitting ? 0.6 : 1 }}
                >
                  {submitting ? 'Sending...' : 'Submit'}
                </button>
              </form>
            )}
          </section>

          <aside className="contact-sidebar-card">
            <h2>Mailing Address:</h2>
            <p>P.O. Box 7601 #83791 Washington, DC 20044</p>

            <h2>International Email:</h2>
            <p>
              <a href="mailto:info@wial.org">info@wial.org</a>
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
