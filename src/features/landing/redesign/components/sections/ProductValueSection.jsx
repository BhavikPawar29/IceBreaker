import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const moments = [
  { id: "date", title: "A date", body: "Make the quiet part feel easy." },
  {
    id: "new-friends",
    title: "Someone new",
    body: "Move past the polite version of you.",
  },
  {
    id: "group-chat",
    title: "A group chat",
    body: "Give the room a reason to open up.",
  },
];

export default function ProductValueSection() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const media = gsap.matchMedia();
    // ponytail: one scoped GSAP sequence gives the page its only scroll story.
    media.add("(min-width: 768px)", () => {
      const image = sectionRef.current?.querySelector(
        ".story-scroll__media img",
      );
      const chapters = gsap.utils.toArray(
        ".story-scroll__chapter",
        sectionRef.current,
      );

      if (image) {
        gsap.to(image, {
          scale: 1.035,
          yPercent: -1.5,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      }

      chapters.forEach((chapter) => {
        gsap.fromTo(
          chapter.children,
          { autoAlpha: 0.24, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
            stagger: 0.06,
            scrollTrigger: {
              trigger: chapter,
              start: "top 76%",
              end: "bottom 48%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    });

    return () => media.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section product-value-section story-section"
      id="situations"
      data-od-id="product-value-section"
    >
      <div className="section__shell story-scroll">
        <figure className="story-scroll__media">
          <img
            src="/editorial/card-exchange.png"
            alt="Two people passing a matte black conversation card across a candlelit bar table."
            loading="lazy"
          />
        </figure>

        <div className="story-scroll__copy">
          <div className="story-scroll__intro">
            <h2>Choose the room.</h2>
            <p>Get one line that belongs there.</p>
          </div>

          {moments.map((item) => (
            <article key={item.id} className="story-scroll__chapter">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
