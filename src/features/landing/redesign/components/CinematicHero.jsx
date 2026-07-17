import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FOCAL_POINTS,
  FRAME_COUNT,
  LAST_FRAME,
  PRELOAD_BATCHES,
  getFramePath,
} from "../lib/sequence";
import { useReducedMotion } from "../lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const requestIdle =
  typeof window !== "undefined" && window.requestIdleCallback
    ? window.requestIdleCallback.bind(window)
    : (callback) => window.setTimeout(callback, 80);

const PREVIEW_PROMPTS = [
  "What’s something you wish people asked you about more often?",
  "What makes you feel instantly understood by someone?",
  "What is a small moment you still think about sometimes?",
];

function findNearestLoaded(target, loadedMap) {
  if (loadedMap.has(target)) {
    return target;
  }

  for (let distance = 1; distance < FRAME_COUNT; distance += 1) {
    const lower = target - distance;
    const upper = target + distance;
    if (lower >= 0 && loadedMap.has(lower)) {
      return lower;
    }
    if (upper < FRAME_COUNT && loadedMap.has(upper)) {
      return upper;
    }
  }

  return null;
}

function drawCoverFrame(canvas, image, scaleProgress) {
  if (!canvas || !image) {
    return;
  }

  const context = canvas.getContext("2d");
  const cssWidth = canvas.clientWidth || window.innerWidth;
  const cssHeight = canvas.clientHeight || window.innerHeight;
  const isMobile = cssWidth < 768;
  const focal = isMobile ? FOCAL_POINTS.mobile : FOCAL_POINTS.desktop;
  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, cssWidth, cssHeight);

  const imageAspect = image.width / image.height;
  const viewportAspect = cssWidth / cssHeight;
  const zoom = 1 + scaleProgress * 0.035;

  let sourceWidth = image.width;
  let sourceHeight = image.height;

  if (imageAspect > viewportAspect) {
    sourceHeight = image.height / zoom;
    sourceWidth = sourceHeight * viewportAspect;
  } else {
    sourceWidth = image.width / zoom;
    sourceHeight = sourceWidth / viewportAspect;
  }

  const maxX = image.width - sourceWidth;
  const maxY = image.height - sourceHeight;
  const sourceX = Math.max(
    0,
    Math.min(maxX, image.width * focal.x - sourceWidth / 2),
  );
  const sourceY = Math.max(
    0,
    Math.min(maxY, image.height * focal.y - sourceHeight / 2),
  );

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    cssWidth,
    cssHeight,
  );
}

export default function CinematicHero({
  onPrimaryAction,
  onNavToneChange,
  onUsePrompt,
  isAuthed,
}) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const storyIntroRef = useRef(null);
  const storyCrossRef = useRef(null);
  const storyOpenRef = useRef(null);
  const storyConnectRef = useRef(null);
  const finalCopyRef = useRef(null);
  const cardPreviewRef = useRef(null);
  const transitionRef = useRef(null);
  const scrollCueRef = useRef(null);
  const rafIdRef = useRef(null);
  const loadedImagesRef = useRef(new Map());
  const loadingPromisesRef = useRef(new Map());
  const sequenceRef = useRef({ frame: 0, holdProgress: 0 });
  const lastFrameRef = useRef(-1);
  const [loaderState, setLoaderState] = useState({ progress: 0, ready: false });
  const [previewPromptIndex, setPreviewPromptIndex] = useState(0);
  const previewPrompt = PREVIEW_PROMPTS[previewPromptIndex];

  const heroLabel = useMemo(
    () =>
      [
        "A rainy cafe scene unfolds one frame at a time.",
        "A card crosses the table, gets opened, and turns a quiet moment into a real conversation.",
      ].join(" "),
    [],
  );

  useEffect(() => {
    let mounted = true;
    let decodedCount = 0;

    const updateProgress = () => {
      if (!mounted) {
        return;
      }

      setLoaderState({
        progress: Math.round((decodedCount / FRAME_COUNT) * 100),
        ready: decodedCount >= 10,
      });
    };

    const syncProgress = () => {
      decodedCount = loadedImagesRef.current.size;
      updateProgress();
    };

    const loadFrame = (index) => {
      if (loadedImagesRef.current.has(index)) {
        return Promise.resolve(loadedImagesRef.current.get(index));
      }

      if (loadingPromisesRef.current.has(index)) {
        return loadingPromisesRef.current.get(index);
      }

      const image = new Image();
      image.decoding = "async";
      image.src = getFramePath(index);

      const promise = new Promise((resolve) => {
        const finalize = () => {
          loadedImagesRef.current.set(index, image);
          syncProgress();
          if (index === 0) {
            drawCoverFrame(canvasRef.current, image, 0);
          }
          resolve(image);
        };

        image.onload = async () => {
          try {
            if (image.decode) {
              await image.decode();
            }
          } catch {
            // decode failure should not block drawing
          }
          finalize();
        };

        image.onerror = () => resolve(null);
      });

      loadingPromisesRef.current.set(index, promise);
      return promise;
    };

    const loadBatch = async ([start, end]) => {
      const promises = [];
      for (let index = start; index <= end; index += 1) {
        promises.push(loadFrame(index));
      }
      await Promise.all(promises);
      syncProgress();
    };

    loadBatch(PRELOAD_BATCHES[0]).then(() => {
      PRELOAD_BATCHES.slice(1).forEach((batch) => {
        requestIdle(() => {
          loadBatch(batch);
        });
      });
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!loaderState.ready) {
      return undefined;
    }

    const requestRender = () => {
      if (rafIdRef.current) {
        return;
      }

      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null;
        const frameIndex = Math.max(
          0,
          Math.min(LAST_FRAME, Math.round(sequenceRef.current.frame)),
        );
        if (frameIndex === lastFrameRef.current) {
          return;
        }

        const nearestFrame = findNearestLoaded(
          frameIndex,
          loadedImagesRef.current,
        );
        if (nearestFrame === null) {
          return;
        }

        const image = loadedImagesRef.current.get(nearestFrame);
        drawCoverFrame(
          canvasRef.current,
          image,
          sequenceRef.current.holdProgress,
        );
        lastFrameRef.current = frameIndex;
      });
    };

    const handleResize = () => {
      const nearestFrame = findNearestLoaded(
        Math.max(
          0,
          Math.min(LAST_FRAME, Math.round(sequenceRef.current.frame)),
        ),
        loadedImagesRef.current,
      );
      if (nearestFrame !== null) {
        drawCoverFrame(
          canvasRef.current,
          loadedImagesRef.current.get(nearestFrame),
          sequenceRef.current.holdProgress,
        );
      }
      ScrollTrigger.refresh();
    };

    if (reducedMotion) {
      const finalImage =
        loadedImagesRef.current.get(LAST_FRAME) ||
        loadedImagesRef.current.get(0);
      if (finalImage) {
        drawCoverFrame(canvasRef.current, finalImage, 0.035);
      }
      onNavToneChange(true);
      window.addEventListener("resize", handleResize);
      window.addEventListener("orientationchange", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("orientationchange", handleResize);
      };
    }

    const getScrollDistance = () => {
      const width = window.innerWidth;
      if (width < 768) {
        return window.innerHeight * 1.2;
      }
      if (width < 1100) {
        return window.innerHeight * 1.6;
      }
      return window.innerHeight * 2;
    };

    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${getScrollDistance()}`,
        pin: true,
        scrub: 0.2,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          onNavToneChange(self.progress > 0.08);
        },
      },
    });

    timeline.to(
      sequenceRef.current,
      {
        frame: LAST_FRAME,
        duration: 0.88,
        onUpdate: requestRender,
      },
      0,
    );

    timeline.to(
      sequenceRef.current,
      {
        holdProgress: 1,
        duration: 1,
        onUpdate: requestRender,
      },
      0,
    );

    timeline
      .fromTo(
        storyIntroRef.current,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.08 },
        0.02,
      )
      .to(storyIntroRef.current, { autoAlpha: 0, y: -16, duration: 0.06 }, 0.18)
      .fromTo(
        storyCrossRef.current,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.08 },
        0.28,
      )
      .to(storyCrossRef.current, { autoAlpha: 0, y: -16, duration: 0.06 }, 0.48)
      .fromTo(
        storyOpenRef.current,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.08 },
        0.56,
      )
      .to(storyOpenRef.current, { autoAlpha: 0, y: -16, duration: 0.06 }, 0.72)
      .fromTo(
        storyConnectRef.current,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.08 },
        0.72,
      )
      .to(
        storyConnectRef.current,
        { autoAlpha: 0, y: -16, duration: 0.05 },
        0.84,
      )
      .fromTo(
        finalCopyRef.current,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.08 },
        0.9,
      )
      .fromTo(
        cardPreviewRef.current,
        { autoAlpha: 0, y: 18, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.08 },
        0.92,
      )
      .to(scrollCueRef.current, { autoAlpha: 0, duration: 0.06 }, 0.1)
      .fromTo(
        transitionRef.current,
        { scaleY: 0 },
        { scaleY: 1, duration: 0.1 },
        0.9,
      );

    document.fonts?.ready?.then(() => ScrollTrigger.refresh());
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    requestRender();

    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
      if (rafIdRef.current) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [loaderState.ready, onNavToneChange, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className={`hero ${reducedMotion ? "is-reduced" : ""}`}
      data-od-id="cinematic-hero"
    >
      <div className="hero__canvas-wrap" aria-hidden="true">
        <canvas ref={canvasRef} className="hero__canvas" />
        <div className="hero__shade hero__shade--left" />
        <div className="hero__shade hero__shade--bottom" />
      </div>

      {!loaderState.ready && (
        <div className="hero__loader" data-od-id="sequence-loader">
          Preparing the moment - {loaderState.progress}%
        </div>
      )}

      <div className="hero__screenreader">{heroLabel}</div>

      <div className="hero__copy-layer">
        <div
          ref={storyIntroRef}
          className="hero__copy hero__copy--left"
          data-od-id="hero-story-intro"
        >
          <p className="eyebrow">Quiet opening</p>
          <h1>Two people. One quiet moment.</h1>
          <p>Neither knows what to say.</p>
        </div>

        <div
          ref={storyCrossRef}
          className="hero__copy hero__copy--right"
          data-od-id="hero-story-cross"
        >
          <p className="eyebrow">The bridge</p>
          <h2>Then one question crosses the space.</h2>
        </div>

        <div
          ref={storyOpenRef}
          className="hero__copy hero__copy--left"
          data-od-id="hero-story-open"
        >
          <p className="eyebrow">Worth answering</p>
          <h2>Not small talk. Something worth answering.</h2>
        </div>

        <div
          ref={storyConnectRef}
          className="hero__copy hero__copy--left"
          data-od-id="hero-story-connect"
        >
          <p className="eyebrow">The turn</p>
          <h2>Awkward silence becomes something real.</h2>
        </div>

        <div
          ref={finalCopyRef}
          className="hero__final"
          data-od-id="hero-final-copy"
        >
          <p className="eyebrow">Breaking Ice</p>
          <h2>Say something real, before the silence wins.</h2>
          <p className="hero__lede">
            Breaking Ice gives you one natural conversation starter for dates,
            crushes, new friends and group chats right when you need it.
          </p>
          <div className="hero__actions">
            <button
              type="button"
              className="button button--primary"
              onClick={() => onPrimaryAction(isAuthed)}
            >
              Try Live Mode
            </button>
            <a className="button button--ghost" href="#how-it-works">
              See how it works
            </a>
          </div>
          <div className="hero__principles">
            <span>One useful line</span>
            <span>Built for real moments</span>
            <span>No endless scrolling</span>
          </div>
        </div>

        <aside
          ref={cardPreviewRef}
          className="conversation-card"
          data-od-id="conversation-card-preview"
        >
          <div className="conversation-card__tone">Deep</div>
          <p className="conversation-card__question">{previewPrompt}</p>
          <div className="conversation-card__actions">
            <button
              type="button"
              className="button button--ghost button--small"
              onClick={() =>
                setPreviewPromptIndex(
                  (index) => (index + 1) % PREVIEW_PROMPTS.length,
                )
              }
            >
              Another one
            </button>
            <button
              type="button"
              className="button button--primary button--small"
              onClick={() =>
                onUsePrompt({
                  id: `landing-preview-${previewPromptIndex}`,
                  pack: "deep",
                  situation: "any",
                  text: previewPrompt,
                })
              }
            >
              Use this
            </button>
          </div>
        </aside>
      </div>

      <div ref={scrollCueRef} className="hero__scroll-cue" aria-hidden="true">
        <span>Scroll down</span>
      </div>

      <div ref={transitionRef} className="hero__transition" />
    </section>
  );
}
