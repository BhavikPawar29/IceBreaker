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

function mergeUniquePrompts(promptGroups) {
  const seenIds = new Set();

  return promptGroups.flatMap((group) =>
    group.filter((prompt) => {
      if (seenIds.has(prompt.id)) {
        return false;
      }

      seenIds.add(prompt.id);
      return true;
    }),
  );
}

async function fetchDirectPrompts(linesCollection, { pack, situation }) {
  const [exactSnapshot, anySnapshot] = await Promise.all([
    getDocs(
      query(
        linesCollection,
        where("status", "==", LINE_STATUS_APPROVED),
        where("pack", "==", pack),
        where("situation", "==", situation),
        limit(SEARCH_LIMIT),
      ),
    ),
    getDocs(
      query(
        linesCollection,
        where("status", "==", LINE_STATUS_APPROVED),
        where("pack", "==", pack),
        where("situation", "==", "any"),
        limit(SEARCH_LIMIT),
      ),
    ),
  ]);

  return mergeUniquePrompts([
    docsToPrompts(exactSnapshot),
    docsToPrompts(anySnapshot),
  ]);
}

async function fetchLegacyPrompts(linesCollection, { pack, situation }) {
  const snapshot = await getDocs(
    query(
      linesCollection,
      where("status", "==", LINE_STATUS_APPROVED),
      limit(SEARCH_LIMIT * 2),
    ),
  );

  return docsToPrompts(snapshot).filter((livePrompt) => {
    const matchesSituation =
      livePrompt.situation === situation || livePrompt.situation === "any";
    const matchesPack = livePrompt.pack === pack;

    return matchesSituation && matchesPack;
  });
}

function useLivePromptSearch(user) {
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [liveState, setLiveState] = useState("idle");
  const [prompt, setPrompt] = useState(null);

  async function findPrompt({ pack, situation }) {
    if (!db || !firebaseConfigReady || !user) {
      setError("Sign in before opening Live Mode.");
      setLiveState("error");
      return null;
    }

    setIsSearching(true);
    setError("");
    setLiveState("loading");

    try {
      const linesCollection = collection(db, "lines");
      let prompts = await fetchDirectPrompts(linesCollection, {
        pack,
        situation,
      });

      // Older approved lines may not have explicit live metadata yet.
      if (!prompts.length) {
        prompts = await fetchLegacyPrompts(linesCollection, {
          pack,
          situation,
        });
      }

      const nextPrompt = pickPrompt(prompts, prompt?.id);

      if (!nextPrompt) {
        setError("No live lines found for that filter yet.");
        setPrompt(null);
        setLiveState("empty");
        return null;
      }

      setPrompt(nextPrompt);
      setLiveState("ready");
      return nextPrompt;
    } catch (nextError) {
      reportError("Failed to find a live prompt.", nextError);
      setError("Could not load a live line for that filter.");
      setLiveState("error");
      return null;
    } finally {
      setIsSearching(false);
    }
  }

  function resetPrompt() {
    setError("");
    setPrompt(null);
    setLiveState("idle");
  }

  return {
    error,
    findPrompt,
    isSearching,
    liveState,
    prompt,
    resetPrompt,
  };
}

export default useLivePromptSearch;
