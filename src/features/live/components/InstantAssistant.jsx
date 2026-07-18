import { useState } from "react";
import { QUESTION_PACKS, SITUATIONS } from "../../board/conversationFilters";
import StatePanel from "../../../shared/ui/StatePanel";

const SHARE_MESSAGE = "This little line saved me from an awkward moment";
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
  const [selectedSituation, setSelectedSituation] = useState(
    () => prompt?.situation || "",
  );
  const [selectedPack, setSelectedPack] = useState(() => prompt?.pack || "");
  const [step, setStep] = useState(() =>
    prompt ? STEP_TRIGGER : STEP_SITUATION,
  );
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

    const shareRuntime = getShareRuntime();
    const shareUrl = shareRuntime?.buildShareUrl("/", {
      surface: "instant_assistant",
      targetPath: "/",
      type: "live_prompt",
    });

    await shareRuntime?.shareUrl({
      shareSurface: "instant_assistant",
      shareType: "live_prompt",
      text: `${SHARE_MESSAGE}\n\n"${prompt.text}"\n\nGet more here:`,
      title: "Breaking Ice",
      url: shareUrl,
    });
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

  function renderLoadingSelection() {
    if (!hasSelection) {
      return null;
    }

    return (
      <div
        className="assistant-loading-tags"
        aria-label="Selected live filters"
      >
        <span>{selectedSituationLabel}</span>
        <span>{selectedPackLabel}</span>
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
            <p className="assistant-card-label">Try this</p>
            <h3>{prompt.text}</h3>
            <p className="assistant-card-note">
              Try it softly. Change the words if you need to.
            </p>
          </article>

          {error ? <p className="assistant-error">{error}</p> : null}

          <div className="assistant-actions">
            <button
              className="assistant-primary-button"
              type="button"
              disabled={isSearching}
              onClick={handleFindPrompt}
            >
              {isSearching ? "Finding..." : "Another tiny nudge"}
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
                <p className="eyebrow">Tonight</p>
                <h2>Who are you hoping to know a little better?</h2>
                <p>Choose the moment. We&apos;ll keep the first words quiet.</p>
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
                <p className="eyebrow">The pause</p>
                <h2>What kind of opening feels right?</h2>
                <p>Light, deeper, or a little bold. Pick what you could say.</p>
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
                <p className="eyebrow">Almost there</p>
                <h2>A small line for the pause.</h2>
                <p>Take one. Then lock the phone.</p>
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
                        {isSearching ? "Finding..." : "Find one"}
                      </span>
                    </span>
                  </button>
                </div>
              ) : null}

              {renderSelectionSummary()}
            </div>
          ) : null}

          {step === STEP_TRIGGER && liveState === "loading" ? (
            <article className="assistant-loading-inline" aria-live="polite">
              <div className="assistant-loading-pill" aria-hidden="true">
                <span></span>
                Finding a line...
              </div>
              {renderLoadingSelection()}
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
                eyebrow="Quiet corner"
                message="Nothing is live for this combo yet. Try another situation or switch the pack."
                title="This corner is still empty."
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
                eyebrow="Connection slipped"
                message="Try again in a moment, or change the combination and search again."
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
