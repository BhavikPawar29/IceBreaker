function Snackbar({ isVisible, message, tone = "info" }) {
  if (!isVisible || !message) {
    return null;
  }

  return (
    <div
      className={`snackbar snackbar--${tone}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}

export default Snackbar;
