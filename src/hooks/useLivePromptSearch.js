import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { useRef, useState } from "react";
import { LINE_STATUS_APPROVED } from "../constants/lineStatuses";
import { db, firebaseConfigReady } from "../lib/firebase";
import { trackEvent } from "../utils/analytics";
import { reportError } from "../utils/reportError";

const SEARCH_LIMIT = 24;
const LEGACY_SEARCH_LIMIT = 200;

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

function pickPrompt(prompts, previousId, seenIds) {
  const unseenPrompts = prompts.filter((prompt) => !seenIds.has(prompt.id));
  const cyclePool = unseenPrompts.length ? unseenPrompts : prompts;
  const promptPool =
    cyclePool.length > 1
      ? cyclePool.filter((prompt) => prompt.id !== previousId)
      : cyclePool;
  const fallbackPool = promptPool.length ? promptPool : cyclePool;
  const index = Math.floor(Math.random() * fallbackPool.length);
  const nextPrompt = fallbackPool[index] || null;

  if (!nextPrompt) {
    return null;
  }

  if (!unseenPrompts.length) {
    seenIds.clear();
  }

  seenIds.add(nextPrompt.id);
  return nextPrompt;
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
      limit(LEGACY_SEARCH_LIMIT),
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
  const seenPromptIdsByFilterRef = useRef(new Map());
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
      const [directPrompts, legacyPrompts] = await Promise.all([
        fetchDirectPrompts(linesCollection, {
          pack,
          situation,
        }),
        fetchLegacyPrompts(linesCollection, {
          pack,
          situation,
        }),
      ]);
      const prompts = mergeUniquePrompts([directPrompts, legacyPrompts]);
      const filterKey = `${pack}:${situation}`;
      const seenIds =
        seenPromptIdsByFilterRef.current.get(filterKey) || new Set();

      seenPromptIdsByFilterRef.current.set(filterKey, seenIds);

      const nextPrompt = pickPrompt(prompts, prompt?.id, seenIds);

      if (!nextPrompt) {
        setError("No live lines found for that filter yet.");
        setPrompt(null);
        setLiveState("empty");
        trackEvent("live_prompt_empty", {
          pack,
          situation,
        });
        return null;
      }

      setPrompt(nextPrompt);
      setLiveState("ready");
      trackEvent("live_prompt_requested", {
        pack,
        prompt_id: nextPrompt.id,
        prompt_source: nextPrompt.id.startsWith("db-") ? "firestore" : "other",
        situation,
      });
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
