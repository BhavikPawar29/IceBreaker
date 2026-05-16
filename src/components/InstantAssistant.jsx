import { useState } from "react";
import { QUESTION_PACKS, SITUATIONS } from "../data/conversationFilters";

const SHARE_MESSAGE = "This saved me from an awkward moment \uD83D\uDC80";

function getShareRuntime() {
  return globalThis.__ICEBREAKER_SHARE__;
}

function InstantAssistant({
  error = "",
  isSearching = false,
  onFindPrompt,
  onReset,
  prompt,
}) {
  const [selectedSituation, setSelectedSituation] = useState(SITUATIONS[0].id);
  const [selectedPack, setSelectedPack] = useState(QUESTION_PACKS[0].id);
  const hasPrompt = Boolean(prompt);

  function handleFindPrompt() {
    onFindPrompt({
      pack: selectedPack,
      situation: selectedSituation,
    });
  }

  async function handleShare() {
    if (!prompt) {
      return;
    }

    await getShareRuntime()?.shareText(`${SHARE_MESSAGE}\n\n"${prompt.text}"`);
  }

  return (
    <section
      className="instant-assistant"
      aria-label="Live conversation assistant"
    >
      {!hasPrompt ? (
        <>
          <div className="assistant-intro assistant-intro--live">
            <p className="eyebrow">Live Mode</p>
            <h2>Pick the moment first.</h2>
          </div>

          <div className="assistant-controls" aria-label="Conversation context">
            <div className="assistant-control-group">
              <span>Situation</span>
              <div className="assistant-chip-row">
                {SITUATIONS.map((situation) => (
                  <button
                    key={situation.id}
                    type="button"
                    className={`assistant-chip ${
                      selectedSituation === situation.id ? "is-active" : ""
                    }`}
                    onClick={() => setSelectedSituation(situation.id)}
                  >
                    {situation.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="assistant-control-group">
              <span>Question pack</span>
              <div className="assistant-chip-row">
                {QUESTION_PACKS.map((pack) => (
                  <button
                    key={pack.id}
                    type="button"
                    className={`assistant-chip ${
                      selectedPack === pack.id ? "is-active" : ""
                    }`}
                    onClick={() => setSelectedPack(pack.id)}
                  >
                    {pack.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error ? <p className="assistant-error">{error}</p> : null}

          <button
            className="assistant-primary-button"
            type="button"
            disabled={isSearching}
            onClick={handleFindPrompt}
          >
            {isSearching ? "Finding..." : "Give me something to say"}
          </button>
        </>
      ) : (
        <>
          <article className="assistant-card" aria-live="polite">
            <p className="assistant-card-label">Say this</p>
            <h3>{prompt.text}</h3>
          </article>

          {error ? <p className="assistant-error">{error}</p> : null}

          <div className="assistant-actions">
            <button
              className="assistant-primary-button"
              type="button"
              disabled={isSearching}
              onClick={handleFindPrompt}
            >
              {isSearching ? "Finding..." : "Refresh"}
            </button>
            <button
              className="assistant-secondary-button"
              type="button"
              onClick={handleShare}
            >
              Share
            </button>
            <button
              className="assistant-secondary-button assistant-secondary-button--plain"
              type="button"
              onClick={onReset}
            >
              Change
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default InstantAssistant;
