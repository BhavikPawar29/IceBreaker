import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { useState } from "react";
import { LINE_STATUS_APPROVED } from "../constants/lineStatuses";
import { db, firebaseConfigReady } from "../lib/firebase";
import { reportError } from "../utils/reportError";

const SEARCH_LIMIT = 24;

const CATEGORY_TO_PACK = {
  curious: "deep",
  deeper: "deep",
  playful: "playful",
  storytime: "deep",
  unexpected: "playful",
};

function mapLineToLivePrompt(line) {
  return {
    id: `db-${line.id}`,
    pack: line.pack || CATEGORY_TO_PACK[line.category] || "playful",
    situation: line.situation || "any",
    text: line.text,
  };
}

function pickPrompt(prompts, previousId) {
  const promptPool =
    prompts.length > 1
      ? prompts.filter((prompt) => prompt.id !== previousId)
      : prompts;
  const index = Math.floor(Math.random() * promptPool.length);

  return promptPool[index] || null;
}

function docsToPrompts(snapshot) {
  return snapshot.docs
    .map((item) => mapLineToLivePrompt({ id: item.id, ...item.data() }))
    .filter((prompt) => prompt.text);
}

function useLivePromptSearch(user) {
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [prompt, setPrompt] = useState(null);

  async function findPrompt({ pack, situation }) {
    if (!db || !firebaseConfigReady || !user) {
      setError("Sign in before opening Live Mode.");
      return null;
    }

    setIsSearching(true);
    setError("");

    try {
      const linesCollection = collection(db, "lines");
      const snapshot = await getDocs(
        query(
          linesCollection,
          where("status", "==", LINE_STATUS_APPROVED),
          limit(SEARCH_LIMIT * 2),
        ),
      );
      const prompts = docsToPrompts(snapshot).filter((livePrompt) => {
        const matchesSituation =
          livePrompt.situation === situation || livePrompt.situation === "any";
        const matchesPack = livePrompt.pack === pack;

        return matchesSituation && matchesPack;
      });

      const nextPrompt = pickPrompt(prompts, prompt?.id);

      if (!nextPrompt) {
        setError("No live lines found for that filter yet.");
        setPrompt(null);
        return null;
      }

      setPrompt(nextPrompt);
      return nextPrompt;
    } catch (nextError) {
      reportError("Failed to find a live prompt.", nextError);
      setError("Could not load a live line for that filter.");
      return null;
    } finally {
      setIsSearching(false);
    }
  }

  function resetPrompt() {
    setError("");
    setPrompt(null);
  }

  return {
    error,
    findPrompt,
    isSearching,
    prompt,
    resetPrompt,
  };
}

export default useLivePromptSearch;
