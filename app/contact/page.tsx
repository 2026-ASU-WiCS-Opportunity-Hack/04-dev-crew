export default function ContactPage() {
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

            <form action="#" className="contact-form">
              <div className="contact-form__field-group">
                <label className="contact-form__label" htmlFor="first-name">
                  Name <span>*</span>
                </label>
                <div className="contact-form__name-row">
                  <div className="contact-form__field">
                    <input id="first-name" type="text" />
                    <small>First</small>
                  </div>
                  <div className="contact-form__field">
                    <input id="last-name" type="text" />
                    <small>Last</small>
                  </div>
                </div>
              </div>

              <div className="contact-form__field-group">
                <label className="contact-form__label" htmlFor="email">
                  E-mail <span>*</span>
                </label>
                <input id="email" type="email" />
              </div>

              <div className="contact-form__field-group">
                <label className="contact-form__label" htmlFor="country">
                  Country <span>*</span>
                </label>
                <input id="country" type="text" />
              </div>

              <div className="contact-form__field-group">
                <label className="contact-form__label" htmlFor="about">
                  About <span>*</span>
                </label>
                <select defaultValue="" id="about">
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
                <textarea id="comment" rows={8} />
              </div>

              <button className="contact-form__submit" type="submit">
                Submit
              </button>
            </form>
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
