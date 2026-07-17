function StatePanel({
  actions = null,
  className = "",
  children = null,
  eyebrow = "",
  loading = false,
  message = "",
  title,
  variant = "default",
}) {
  return (
    <article
      className={`state-panel state-panel--${variant} ${className}`.trim()}
      aria-live="polite"
    >
      {loading ? (
        <div className="state-panel__pulse" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
      ) : null}
      {eyebrow ? <p className="state-panel__eyebrow">{eyebrow}</p> : null}
      <h3>{title}</h3>
      {message ? <p>{message}</p> : null}
      {children}
      {actions ? <div className="state-panel__actions">{actions}</div> : null}
    </article>
  );
}

export default StatePanel;
