import { useEffect, useState } from "react";
import { ALLOWED_CATEGORIES, DEFAULT_CATEGORY } from "../constants/categories";
import { formatCategory } from "../utils/board";
import { validateLineSubmission } from "../utils/contentValidation";
import Snackbar from "./Snackbar";

const SUBMIT_COOLDOWN_MS = 30 * 1000;
const SUBMIT_COOLDOWN_KEY = "icebreaker-last-submit-at";

function SubmitCard({ authEnabled, lookupExistingLine, onSubmit, user }) {
  const [form, setForm] = useState({
    category: DEFAULT_CATEGORY,
    text: "",
  });
  const [feedback, setFeedback] = useState({ message: "", tone: "info" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!feedback.message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback({ message: "", tone: "info" });
    }, 4200);

    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  function showFeedback(message, tone = "info") {
    setFeedback({ message, tone });
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!authEnabled) {
      showFeedback(
        "Connect Firebase first, then you can send ideas in.",
        "warning",
      );
      return;
    }

    if (!user) {
      showFeedback("Sign in first so we know who sent the idea.", "warning");
      return;
    }

    const validationMessage = validateLineSubmission({
      category: form.category,
      text: form.text,
    });

    if (validationMessage) {
      showFeedback(validationMessage, "warning");
      return;
    }

    const lastSubmitAt = Number(localStorage.getItem(SUBMIT_COOLDOWN_KEY) || 0);
    const remainingMs = SUBMIT_COOLDOWN_MS - (Date.now() - lastSubmitAt);

    if (remainingMs > 0) {
      showFeedback(
        `Give it a moment. You can send another idea in ${Math.ceil(remainingMs / 1000)}s.`,
        "warning",
      );
      return;
    }

    setIsSubmitting(true);
    const result = await onSubmit({
      category: form.category,
      text: form.text.trim(),
    });

    const existingLine = result.existingLineRef
      ? await lookupExistingLine(result.existingLineRef)
      : null;
    const duplicateMessage = result.duplicateWarning
      ? existingLine
        ? existingLine.status === "approved"
          ? "That idea is already live on IceBreaker."
          : "That idea is already waiting for review."
        : result.duplicateWarning
      : "";
    const nextNote = [result.message, duplicateMessage]
      .filter(Boolean)
      .join(" ");

    setIsSubmitting(false);
    showFeedback(nextNote, result.ok ? "success" : "warning");

    if (!result.ok) {
      return;
    }

    localStorage.setItem(SUBMIT_COOLDOWN_KEY, String(Date.now()));
    setForm({
      category: form.category,
      text: "",
    });
  }

  return (
    <div className="section-card submit-card" id="submit">
      <div className="card-heading">
        <p className="eyebrow">Share one</p>
        <h3>Add a conversation idea</h3>
      </div>
      <form className="submission-form" onSubmit={handleSubmit}>
        <label>
          <span>Category</span>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            {ALLOWED_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {formatCategory(category)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Your line</span>
          <textarea
            name="text"
            rows="5"
            maxLength="240"
            placeholder="Example: You seem like the kind of person who always finds the hidden best item on a menu."
            required
            disabled={!user || isSubmitting}
            value={form.text}
            onChange={handleChange}
          />
        </label>
        <button
          type="submit"
          className="submit-button"
          disabled={!authEnabled || !user || isSubmitting}
        >
          {isSubmitting
            ? "Sending..."
            : user
              ? "Send for review"
              : "Sign in to publish"}
        </button>
      </form>
      <Snackbar
        isVisible={Boolean(feedback.message)}
        message={feedback.message}
        tone={feedback.tone}
      />
    </div>
  );
}

export default SubmitCard;
