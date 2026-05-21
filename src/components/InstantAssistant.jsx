import { useState } from "react";
import { QUESTION_PACKS, SITUATIONS } from "../data/conversationFilters";
import StatePanel from "./StatePanel";

const SHARE_MESSAGE = "This saved me from an awkward moment \uD83D\uDC80";
const STEP_SITUATION = "situation";
const STEP_PACK = "pack";
const STEP_TRIGGER = "trigger";

function getShareRuntime() {
  return globalThis.__ICEBREAKER_SHARE__;
}

function findLabel(items, id) {
  return items.find((item) => item.id === id)?.label || "";
}

function InstantAssistant({
  error = "",
  isSearching = false,
  liveState = "idle",
  onFindPrompt,
  onReset,
  prompt,
}) {
  const [selectedSituation, setSelectedSituation] = useState("");
  const [selectedPack, setSelectedPack] = useState("");
  const [step, setStep] = useState(STEP_SITUATION);
  const hasPrompt = Boolean(prompt);
  const selectedSituationLabel = findLabel(SITUATIONS, selectedSituation);
  const selectedPackLabel = findLabel(QUESTION_PACKS, selectedPack);
  const hasSelection = Boolean(selectedSituationLabel && selectedPackLabel);

  function handleFindPrompt() {
    if (!selectedSituation || !selectedPack) {
      return;
    }

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

  function handleSituationSelect(situationId) {
    setSelectedSituation(situationId);
    setStep(STEP_PACK);
  }

  function handlePackSelect(packId) {
    setSelectedPack(packId);
    setStep(STEP_TRIGGER);
  }

  function handleRetry() {
    handleFindPrompt();
  }

  function handleChange() {
    onReset();
    setSelectedSituation("");
    setSelectedPack("");
    setStep(STEP_SITUATION);
  }

  function renderSelectionSummary(extraClassName = "") {
    if (!hasSelection) {
      return null;
    }

    return (
      <div
        className={`assistant-selection-summary ${extraClassName}`.trim()}
        aria-label="Selected live filters"
      >
        <span className="assistant-selection-pill">
          {selectedSituationLabel}
        </span>
        <span className="assistant-selection-pill">{selectedPackLabel}</span>
      </div>
    );
  }

  return (
    <section
      className={`instant-assistant section-card ${hasPrompt ? "instant-assistant--result" : ""}`.trim()}
      aria-label="Live conversation assistant"
    >
      {hasPrompt ? (
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
              onClick={handleChange}
            >
              Change
            </button>
          </div>
        </>
      ) : (
        <>
          {step === STEP_SITUATION ? (
            <div className="assistant-step assistant-step--choices">
              <div className="assistant-intro assistant-intro--live">
                <p className="eyebrow">Live Mode</p>
                <h2>What situation?</h2>
                <p>
                  Pick the moment first so we can pull a line that actually
                  fits.
                </p>
              </div>

              <div
                className="assistant-choice-grid"
                aria-label="Situation options"
              >
                {SITUATIONS.map((situation) => (
                  <button
                    key={situation.id}
                    type="button"
                    className={`assistant-choice-button ${
                      selectedSituation === situation.id ? "is-active" : ""
                    }`}
                    onClick={() => handleSituationSelect(situation.id)}
                  >
                    {situation.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === STEP_PACK ? (
            <div className="assistant-step assistant-step--choices">
              <div className="assistant-intro assistant-intro--live">
                <p className="eyebrow">Step 2</p>
                <h2>Question pack?</h2>
                <p>
                  Choose the tone you want before we spin up the next thing to
                  say.
                </p>
              </div>

              <div
                className="assistant-choice-grid"
                aria-label="Question pack options"
              >
                {QUESTION_PACKS.map((pack) => (
                  <button
                    key={pack.id}
                    type="button"
                    className={`assistant-choice-button ${
                      selectedPack === pack.id ? "is-active" : ""
                    }`}
                    onClick={() => handlePackSelect(pack.id)}
                  >
                    {pack.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === STEP_TRIGGER &&
          liveState !== "empty" &&
          liveState !== "error" ? (
            <div className="assistant-step assistant-step--trigger">
              <div className="assistant-intro assistant-intro--live assistant-intro--centered">
                <p className="eyebrow">Ready</p>
                <h2>Tap for a line</h2>
                <p>
                  We will use your selected situation and pack to pull one good
                  question.
                </p>
              </div>

              {liveState !== "loading" ? (
                <div className="assistant-orb-stage">
                  <button
                    className={`assistant-orb-button ${
                      isSearching ? "is-searching" : ""
                    }`}
                    type="button"
                    aria-label="Tap for a line"
                    disabled={isSearching}
                    onClick={handleFindPrompt}
                  >
                    <span className="assistant-orb-button__inner">
                      <span className="assistant-orb-button__label">
                        {isSearching ? "Shuffling..." : "Tap for a line"}
                      </span>
                    </span>
                  </button>
                </div>
              ) : null}

              {renderSelectionSummary()}
            </div>
          ) : null}

          {step === STEP_TRIGGER && liveState === "loading" ? (
            <article
              className="assistant-live-search section-card"
              aria-live="polite"
            >
              <div className="assistant-orb-stage">
                <div
                  className="assistant-orb-button is-searching"
                  aria-hidden="true"
                >
                  <span className="assistant-orb-button__inner">
                    <span className="assistant-orb-button__label">
                      Shuffling...
                    </span>
                  </span>
                </div>
              </div>
              {renderSelectionSummary("assistant-selection-summary--quiet")}
            </article>
          ) : null}

          {step === STEP_TRIGGER && liveState === "empty" ? (
            <div className="assistant-state-stack">
              <StatePanel
                actions={
                  <button
                    className="assistant-primary-button"
                    type="button"
                    onClick={handleChange}
                  >
                    Change picks
                  </button>
                }
                className="assistant-feedback assistant-feedback--compact section-card"
                eyebrow="Ooh, you caught us"
                message="Nothing is live for this combo yet. Try another situation or switch the pack while the board warms up."
                title="This combo is still waiting for its moment."
                variant="empty"
              />
            </div>
          ) : null}

          {step === STEP_TRIGGER && liveState === "error" ? (
            <div className="assistant-state-stack assistant-state-stack--error">
              {renderSelectionSummary("assistant-selection-summary--quiet")}
              <StatePanel
                actions={
                  <>
                    <button
                      className="assistant-primary-button"
                      type="button"
                      disabled={isSearching}
                      onClick={handleRetry}
                    >
                      Try again
                    </button>
                    <button
                      className="assistant-secondary-button"
                      type="button"
                      onClick={handleChange}
                    >
                      Change picks
                    </button>
                  </>
                }
                className="assistant-feedback assistant-feedback--compact section-card"
                eyebrow="Connection hiccup"
                message="Try again in a moment, or change the combination and spin a new search."
                title={error || "Could not load a live line."}
                variant="error"
              />
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

export default InstantAssistant;
