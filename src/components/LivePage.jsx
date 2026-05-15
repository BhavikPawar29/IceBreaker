import InstantAssistant from "./InstantAssistant";
import useLivePromptSearch from "../hooks/useLivePromptSearch";

function LivePage({ user }) {
  const { error, findPrompt, isSearching, prompt, resetPrompt } =
    useLivePromptSearch(user);

  return (
    <section className="live-page-shell">
      <InstantAssistant
        error={error}
        isSearching={isSearching}
        onFindPrompt={findPrompt}
        onReset={resetPrompt}
        prompt={prompt}
      />
    </section>
  );
}

export default LivePage;
