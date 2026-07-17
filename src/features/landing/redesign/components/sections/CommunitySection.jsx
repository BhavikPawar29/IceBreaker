import { Link } from "react-router-dom";

export default function CommunitySection() {
  return (
    <section
      className="section community-section"
      data-od-id="community-section"
    >
      <div className="section__shell community-chapter">
        <figure className="community-chapter__image">
          <img
            src="/editorial/late-night-kitchen.png"
            alt="Three friends sharing a warm late-night conversation in a kitchen."
            loading="lazy"
          />
        </figure>

        <div className="community-chapter__content">
          <h2>Good questions travel.</h2>
          <p>Keep the ones that make people lean in.</p>
          <Link className="text-link" to="/lines">
            Explore the community
          </Link>
        </div>
      </div>
    </section>
  );
}
