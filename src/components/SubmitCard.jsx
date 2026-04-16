import { useState } from "react";
import { formatCategory } from "../utils/board";

const defaultCategory = "playful";

function SubmitCard({ categories, onSubmit }) {
  const [form, setForm] = useState({
    category: categories[0] || defaultCategory,
    text: "",
    author: "",
  });
  const [note, setNote] = useState(
    "New submissions stay local in this MVP and are saved in your browser.",
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (form.text.trim().length < 12) {
      setNote("Add a little more detail so the line feels testable.");
      return;
    }

    onSubmit({
      category: form.category,
      text: form.text.trim(),
      author: form.author.trim(),
    });

    setForm({
      category: form.category,
      text: "",
      author: "",
    });
    setNote("Published. Your line is now part of the board on this device.");
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
          <select name="category" value={form.category} onChange={handleChange} required>
            {(categories.length ? categories : [defaultCategory]).map((category) => (
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
            value={form.author}
            onChange={handleChange}
          />
        </label>
        <button type="submit" className="submit-button">
          Publish line
        </button>
        <p className="form-note">{note}</p>
      </form>
    </div>
  );
}

export default SubmitCard;
