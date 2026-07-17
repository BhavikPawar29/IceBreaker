import { useLocation } from "react-router-dom";
import InstantAssistant from "./InstantAssistant";
import useLivePromptSearch from "../hooks/useLivePromptSearch";

function LivePage({ user }) {
  const { state } = useLocation();
  const { error, findPrompt, isSearching, liveState, prompt, resetPrompt } =
    useLivePromptSearch(user, state?.previewPrompt);

  return (
    <section className="live-page-shell">
      <InstantAssistant
        error={error}
        isSearching={isSearching}
        liveState={liveState}
        onFindPrompt={findPrompt}
        onReset={resetPrompt}
        prompt={prompt}
      />
    </section>
  );
}

export default LivePage;
