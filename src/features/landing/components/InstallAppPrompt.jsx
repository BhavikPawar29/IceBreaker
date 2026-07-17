import { useEffect, useState } from "react";

const INSTALL_PROMPT_DISMISSED_KEY = "breaking-ice-install-prompt-dismissed";

function isStandaloneApp() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );
}

function InstallAppPrompt({ user }) {
  const [installEvent, setInstallEvent] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!user || isStandaloneApp()) {
      setIsVisible(false);
      return undefined;
    }

    const isDismissed =
      localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY) === "true";

    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallEvent(event);

      if (!isDismissed) {
        setIsVisible(true);
      }
    }

    function handleInstalled() {
      setIsVisible(false);
      setInstallEvent(null);
      localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, "true");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, [user]);

  async function handleInstall() {
    if (!installEvent) {
      return;
    }

    setIsVisible(false);
    await installEvent.prompt();
    setInstallEvent(null);
    localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, "true");
  }

  function handleDismiss() {
    setIsVisible(false);
    localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, "true");
  }

  if (!user || !installEvent || !isVisible) {
    return null;
  }

  return (
    <aside className="install-prompt" role="dialog" aria-label="Install app">
      <div>
        <p className="install-prompt__eyebrow">Faster next time</p>
        <h2>Install Breaking Ice?</h2>
        <p>
          Add it to your phone or desktop so Live Mode opens quickly when the
          conversation gets quiet.
        </p>
      </div>
      <div className="install-prompt__actions">
        <button type="button" className="ink-link" onClick={handleInstall}>
          Install app
        </button>
        <button type="button" className="ghost-link" onClick={handleDismiss}>
          Not now
        </button>
      </div>
    </aside>
  );
}

export default InstallAppPrompt;
