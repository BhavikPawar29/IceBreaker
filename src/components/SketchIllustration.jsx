import { useState } from "react";

const DESIGN_MD_URL = "https://designwith.abhijeetkakade.in/";

function SketchIllustration() {
  const [creditPosition, setCreditPosition] = useState({
    isVisible: false,
    x: 0,
    y: 0,
  });

  function handlePointerMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect();

    setCreditPosition({
      isVisible: true,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
  }

  function handlePointerLeave() {
    setCreditPosition((current) => ({
      ...current,
      isVisible: false,
    }));
  }

  return (
    <a
      className="illustration-panel illustration-panel--credited"
      href={DESIGN_MD_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Designed using design.md"
      onMouseEnter={handlePointerMove}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
    >
      <div className="sun-wash"></div>
      <svg viewBox="0 0 540 680" className="city-sketch" role="img">
        <title>Sketch-style conversation scene</title>

        <path
          className="sketch-ground"
          d="M86 555C156 518 238 503 316 510C383 516 436 541 484 586"
        />
        <path
          className="sketch-ground sketch-ground--soft"
          d="M118 590C184 560 265 552 340 563C393 571 434 591 469 618"
        />

        <path
          className="chat-bubble"
          d="M92 208C92 170 121 142 158 142H237C277 142 307 173 307 213V236C307 276 277 306 237 306H184L145 334L152 306H158C121 306 92 278 92 240Z"
        />
        <path
          className="chat-bubble chat-bubble--right"
          d="M265 268C265 228 296 197 336 197H411C452 197 484 229 484 271V295C484 336 452 368 411 368H383L349 395L356 368H336C296 368 265 337 265 297Z"
        />

        <path className="bubble-line" d="M132 196H248" />
        <path className="bubble-line" d="M132 228H222" />
        <path className="bubble-line bubble-line--short" d="M132 260H196" />

        <path className="bubble-line" d="M305 250H431" />
        <path className="bubble-line" d="M305 282H413" />
        <path className="bubble-line bubble-line--short" d="M305 314H374" />

        <path
          className="heart-doodle"
          d="M272 417C252 386 214 380 191 404C167 430 171 470 214 498C246 520 267 534 272 540C277 534 299 519 330 498C374 469 377 430 353 404C330 380 292 386 272 417Z"
        />

        <circle cx="215" cy="472" r="40" className="accent-node" />
        <circle
          cx="356"
          cy="431"
          r="28"
          className="accent-node accent-node--small"
        />
        <circle
          cx="269"
          cy="365"
          r="16"
          className="accent-node accent-node--tiny"
        />

        <path
          className="spark spark-a"
          d="M139 392L150 370L161 392L183 403L161 413L150 435L139 413L117 403Z"
        />
        <path
          className="spark spark-b"
          d="M410 150L419 133L428 150L445 159L428 168L419 185L410 168L393 159Z"
        />

        <path className="connector" d="M208 347C223 337 239 334 257 336" />
        <path className="connector" d="M287 338C307 335 323 339 339 349" />
      </svg>
      <div className="floating-note floating-note-a">
        ranked by people, not AI
      </div>
      <div className="floating-note floating-note-b">
        warm starts / real chemistry
      </div>
      <div
        className={`illustration-credit ${creditPosition.isVisible ? "is-visible" : ""}`}
        style={{
          left: `${creditPosition.x}px`,
          top: `${creditPosition.y}px`,
        }}
      >
        Designed using design.md
      </div>
    </a>
  );
}

export default SketchIllustration;
