export default function FinalCtaSection({ isAuthed, onPrimaryAction }) {
  return (
    <section
      className="section section--closing final-cta-section"
      data-od-id="final-cta-section"
    >
      <div className="section__shell final-quiet">
        <p>One honest line is enough to start.</p>
        <h2>Try it in the moment.</h2>
        <button
          type="button"
          className="button button--primary"
          onClick={() => onPrimaryAction(isAuthed)}
        >
          Try Live Mode
        </button>
      </div>
    </section>
  );
}
