function SketchIllustration() {
  return (
    <div className="illustration-panel" aria-hidden="true">
      <div className="sun-wash"></div>
      <svg viewBox="0 0 540 680" className="city-sketch" role="img">
        <title>Sketch-style city scene</title>
        <path d="M46 544C109 485 127 409 147 341C173 254 204 186 284 145C341 116 386 118 451 136" />
        <path d="M47 545C127 519 183 513 257 515C312 516 383 537 477 584" />
        <path d="M116 333L162 235L220 228L214 350" />
        <path d="M212 347L240 208L309 192L329 374" />
        <path d="M321 373L351 162L425 179L451 437" />
        <path d="M95 410L152 396L147 455L83 470" />
        <path d="M213 430L290 416L295 486L208 499" />
        <path d="M362 457L441 446L450 518L353 536" />
        <path d="M76 584C136 552 178 542 237 544" />
        <path d="M272 549C327 548 378 564 463 613" />
        <path d="M123 511C150 491 171 486 198 501" />
        <path d="M316 517C347 493 376 489 404 511" />
        <circle cx="188" cy="458" r="38" className="accent-node" />
        <circle
          cx="376"
          cy="414"
          r="26"
          className="accent-node accent-node--small"
        />
        <path d="M94 296L165 286" />
        <path d="M228 254L315 239" />
        <path d="M351 228L427 241" />
      </svg>
      <div className="floating-note floating-note-a">
        ranked by people, not AI
      </div>
      <div className="floating-note floating-note-b">
        sketchbook energy / clean signal
      </div>
    </div>
  );
}

export default SketchIllustration;
