import { useState } from "react";
import { createPortal } from "react-dom";
import { QUESTION_PACKS, SITUATIONS } from "../../board/conversationFilters";
import StatePanel from "../../../shared/ui/StatePanel";

const SHARE_MESSAGE = "This little line saved me from an awkward moment";
const STEP_SITUATION = "situation";
const STEP_PACK = "pack";

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
  const [pickerStep, setPickerStep] = useState(STEP_SITUATION);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const hasPrompt = Boolean(prompt);
  const selectedSituationLabel = findLabel(SITUATIONS, selectedSituation);
  const selectedPackLabel = findLabel(QUESTION_PACKS, selectedPack);
  const hasSelection = Boolean(selectedSituationLabel && selectedPackLabel);

  function requestPrompt(
    situationId = selectedSituation,
    packId = selectedPack,
  ) {
    if (!situationId || !packId) {
      return;
    }

    onFindPrompt({
      pack: packId,
      situation: situationId,
    });
  }

  function handleFindPrompt() {
    if (!hasSelection) {
      setPickerStep(STEP_SITUATION);
      setIsPickerOpen(true);
      return;
    }

    requestPrompt();
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
    setPickerStep(STEP_PACK);
  }

  function handlePackSelect(packId) {
    setSelectedPack(packId);
    setIsPickerOpen(false);
    requestPrompt(selectedSituation, packId);
  }

  function handleRetry() {
    handleFindPrompt();
  }

  function handleChange() {
    onReset();
    setSelectedSituation("");
    setSelectedPack("");
    setPickerStep(STEP_SITUATION);
    setIsPickerOpen(true);
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

  function renderPickerDrawer() {
    if (!isPickerOpen || typeof document === "undefined") {
      return null;
    }

    const isSituationStep = pickerStep === STEP_SITUATION;

    return createPortal(
      <div
        className="assistant-drawer-backdrop"
        role="presentation"
        onClick={() => setIsPickerOpen(false)}
      >
        <aside
          aria-labelledby="assistant-drawer-title"
          aria-modal="true"
          className="assistant-drawer"
          role="dialog"
          onClick={(event) => event.stopPropagation()}
        >
          <span className="assistant-drawer-handle" aria-hidden="true"></span>
          <div className="assistant-drawer-head">
            <p className="eyebrow">
              {isSituationStep ? "Step 1 of 2" : "Step 2 of 2"}
            </p>
            <h3 id="assistant-drawer-title">
              {isSituationStep
                ? "Where are you using it?"
                : "What should it feel like?"}
            </h3>
            <p>
              {isSituationStep
                ? "Pick the moment first."
                : "Now choose the type of line."}
            </p>
          </div>

          <div className="assistant-drawer-options">
            {(isSituationStep ? SITUATIONS : QUESTION_PACKS).map((item) => (
              <button
                key={item.id}
                type="button"
                className={`assistant-choice-button ${
                  (isSituationStep ? selectedSituation : selectedPack) ===
                  item.id
                    ? "is-active"
                    : ""
                }`}
                onClick={() =>
                  isSituationStep
                    ? handleSituationSelect(item.id)
                    : handlePackSelect(item.id)
                }
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="assistant-drawer-actions">
            {!isSituationStep ? (
              <button
                className="assistant-secondary-button"
                type="button"
                onClick={() => setPickerStep(STEP_SITUATION)}
              >
                Back
              </button>
            ) : null}
            <button
              className="assistant-secondary-button assistant-secondary-button--plain"
              type="button"
              onClick={() => setIsPickerOpen(false)}
            >
              Not now
            </button>
          </div>
        </aside>
      </div>,
      document.body,
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
          {liveState !== "empty" && liveState !== "error" ? (
            <div className="assistant-step assistant-step--trigger">
              <div className="assistant-intro assistant-intro--live assistant-intro--centered">
                <p className="eyebrow">
                  {hasSelection ? "Almost there" : "Live mode"}
                </p>
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

          {liveState === "loading" ? (
            <article className="assistant-loading-inline" aria-live="polite">
              <div className="assistant-loading-pill" aria-hidden="true">
                <span></span>
                Finding a line...
              </div>
              {renderLoadingSelection()}
            </article>
          ) : null}

          {liveState === "empty" ? (
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

          {liveState === "error" ? (
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

          {renderPickerDrawer()}
        </>
      )}
    </section>
  );
}

export default InstantAssistant;
