const steps = [
  {
    title: "Pick a room",
    body: "Date, crush, new people, or a group chat.",
  },
  {
    title: "Take one line",
    body: "Keep the one that sounds like you.",
  },
  {
    title: "Put the phone down",
    body: "The next part belongs in the room.",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      className="section how-section"
      id="how-it-works"
      data-od-id="how-it-works-section"
    >
      <div className="section__shell how-rail">
        <figure className="how-rail__visual">
          <img
            src="/editorial/living-room-circle.png"
            alt="Four friends sharing a spontaneous late-night conversation in an apartment."
            loading="lazy"
          />
        </figure>

        <div className="how-rail__lower">
          <div className="how-rail__intro">
            <h2>A small nudge. Then leave.</h2>
          </div>

          <ol className="how-rail__steps">
            {steps.map((step) => (
              <li key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
