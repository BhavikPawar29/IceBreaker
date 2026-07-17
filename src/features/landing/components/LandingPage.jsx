import { useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { safeTrackEvent } from "../../../shared/core/analytics";
import CinematicHero from "../redesign/components/CinematicHero";
import RedesignFooter from "../redesign/components/Footer";
import LandingNavigation from "../redesign/components/LandingNavigation";
import CommunitySection from "../redesign/components/sections/CommunitySection";
import FinalCtaSection from "../redesign/components/sections/FinalCtaSection";
import HowItWorksSection from "../redesign/components/sections/HowItWorksSection";
import ProductValueSection from "../redesign/components/sections/ProductValueSection";

function LandingPage({ user }) {
  const navigate = useNavigate();
  const [navSolid, setNavSolid] = useState(false);

  useLayoutEffect(() => {
    const styleId = "breaking-ice-redesign-styles";
    const existing = document.getElementById(styleId);
    const stylesheet = existing || document.createElement("link");

    if (!existing) {
      stylesheet.id = styleId;
      stylesheet.rel = "stylesheet";
      stylesheet.href = "/landing-redesign.css";
      document.head.append(stylesheet);
    }

    document.documentElement.classList.add("landing-no-scrollbar");

    const refreshScrollTriggers = () => {
      window.requestAnimationFrame(() => {
        window.dispatchEvent(new Event("resize"));
      });
    };

    stylesheet.addEventListener("load", refreshScrollTriggers);
    refreshScrollTriggers();

    return () => {
      document.documentElement.classList.remove("landing-no-scrollbar");
      stylesheet.removeEventListener("load", refreshScrollTriggers);
      if (!existing) {
        stylesheet.remove();
      }
    };
  }, []);

  function openLiveMode() {
    const destination = user ? "/live" : "/login";

    safeTrackEvent("cta_clicked", {
      cta_location: "landing_redesign",
      cta_name: "try_live_mode",
      destination,
    });
    navigate(destination);
  }

  function usePreviewPrompt(prompt) {
    const destination = user ? "/live" : "/login";

    safeTrackEvent("cta_clicked", {
      cta_location: "landing_redesign_preview",
      cta_name: "use_this_prompt",
      destination,
    });
    navigate(destination, { state: { previewPrompt: prompt } });
  }

  return (
    <div className="landing-redesign">
      <LandingNavigation
        isAuthed={Boolean(user)}
        onPrimaryAction={openLiveMode}
        solid={navSolid}
      />
      <div id="main-content">
        <CinematicHero
          isAuthed={Boolean(user)}
          onNavToneChange={setNavSolid}
          onPrimaryAction={openLiveMode}
          onUsePrompt={usePreviewPrompt}
        />
        <ProductValueSection />
        <HowItWorksSection />
        <CommunitySection />
        <FinalCtaSection
          isAuthed={Boolean(user)}
          onPrimaryAction={openLiveMode}
        />
      </div>
      <RedesignFooter />
    </div>
  );
}

export default LandingPage;
