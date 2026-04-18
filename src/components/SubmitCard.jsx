import { useState } from "react";
import { formatCategory } from "../utils/board";

const defaultCategory = "playful";

function SubmitCard({
  authEnabled,
  categories,
  lookupExistingLine,
  onSubmit,
  user,
}) {
  const [form, setForm] = useState({
    category: categories[0] || defaultCategory,
    text: "",
    author: "",
  });
  const [note, setNote] = useState(
    "Sign in with Google to publish lines into Firestore and vote with your account.",
  );

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
      setNote("Add your Firebase config first, then sign in to publish lines.");
      return;
    }

    if (!user) {
      setNote("Sign in with Google before publishing to the board.");
      return;
    }

    if (form.text.trim().length < 12) {
      setNote("Add a little more detail so the line feels testable.");
      return;
    }

    const result = await onSubmit({
      category: form.category,
      text: form.text.trim(),
      author: form.author.trim(),
    });

    const existingLine = await lookupExistingLine(result.existingLineRef);
    const duplicateMessage = result.duplicateWarning
      ? existingLine
        ? `${result.duplicateWarning} Existing record: ${existingLine.collection}/${existingLine.id}.`
        : result.duplicateWarning
      : "";
    const nextNote = [result.message, duplicateMessage]
      .filter(Boolean)
      .join(" ");

    setNote(nextNote);

    if (!result.ok) {
      return;
    }

    setForm({
      category: form.category,
      text: "",
      author: "",
    });
  }

  return (
    <div className="section-card submit-card" id="submit">
      <div className="card-heading">
        <p className="eyebrow">Contribute</p>
        <h3>Drop a line into the board</h3>
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
            {(categories.length ? categories : [defaultCategory]).map(
              (category) => (
                <option key={category} value={category}>
                  {formatCategory(category)}
                </option>
              ),
            )}
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
            disabled={!user}
            value={form.text}
            onChange={handleChange}
          />
        </label>
        <label>
          <span>Name or alias</span>
          <input
            name="author"
            type="text"
            maxLength="32"
            placeholder="anonymous sketcher"
            disabled={!user}
            value={form.author}
            onChange={handleChange}
          />
        </label>
        <button
          type="submit"
          className="submit-button"
          disabled={!authEnabled || !user}
        >
          {user ? "Publish line" : "Sign in to publish"}
        </button>
        <p className="form-note">{note}</p>
      </form>
    </div>
  );
}

export default SubmitCard;
