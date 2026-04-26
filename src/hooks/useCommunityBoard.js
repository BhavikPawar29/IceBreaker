import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  startAfter,
  where,
} from "firebase/firestore";
import { emptyBoardState } from "../data/seedLines";
import {
  LINE_STATUS_APPROVED,
  LINE_STATUS_PENDING,
  LINE_STATUS_REJECTED,
} from "../constants/lineStatuses";
import { db, firebaseConfigReady } from "../lib/firebase";
import { createLineFingerprint } from "../utils/textNormalization";
import { sortLines } from "../utils/board";
import { validateLineSubmission } from "../utils/contentValidation";
import { validateDisplayName } from "../utils/profileValidation";

const PROMOTION_THRESHOLD = 50;
const PAGE_SIZE = 10;

function mapDocs(snapshot) {
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

function useCommunityBoard(user, activeBoardView = null, isAdmin = false) {
  const boardEnabled = Boolean(activeBoardView);
  const [candidateLines, setCandidateLines] = useState(
    emptyBoardState.candidateLines,
  );
  const [promotedLines, setPromotedLines] = useState(
    emptyBoardState.promotedLines,
  );
  const [pendingLines, setPendingLines] = useState([]);
  const [candidateCursor, setCandidateCursor] = useState(null);
  const [promotedCursor, setPromotedCursor] = useState(null);
  const [hasMoreCandidates, setHasMoreCandidates] = useState(true);
  const [hasMorePromoted, setHasMorePromoted] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [userLines, setUserLines] = useState(emptyBoardState.userLines);
  const [votes, setVotes] = useState(emptyBoardState.votes);
  const [isBoardLoading, setIsBoardLoading] = useState(firebaseConfigReady);
  const [boardError, setBoardError] = useState("");

  useEffect(() => {
    if (!db || !boardEnabled) {
      setCandidateLines(emptyBoardState.candidateLines);
      setPromotedLines(emptyBoardState.promotedLines);
      setPendingLines([]);
      setCandidateCursor(null);
      setPromotedCursor(null);
      setHasMoreCandidates(true);
      setHasMorePromoted(true);
      setIsFetchingMore(false);
      setUserLines(emptyBoardState.userLines);
      setVotes(emptyBoardState.votes);
      setIsBoardLoading(false);
      setBoardError("");
      return undefined;
    }

    let isCancelled = false;

    async function loadInitialBoard() {
      setIsBoardLoading(true);
      setBoardError("");

      try {
        const shouldLoadCandidates = activeBoardView === "candidates";
        const shouldLoadPromoted = activeBoardView === "promoted";
        const shouldLoadProfile = activeBoardView === "profile";
        const shouldLoadAdmin = activeBoardView === "admin" && isAdmin;

        const candidatePromise = shouldLoadCandidates
          ? getDocs(
              query(
                collection(db, "lines"),
                where("status", "==", LINE_STATUS_APPROVED),
                where("promoted", "==", false),
                orderBy("score", "desc"),
                orderBy("createdAt", "desc"),
                limit(PAGE_SIZE),
              ),
            )
          : Promise.resolve(null);

        const promotedPromise = shouldLoadPromoted
          ? getDocs(
              query(
                collection(db, "lines"),
                where("status", "==", LINE_STATUS_APPROVED),
                where("promoted", "==", true),
                orderBy("promotedAt", "desc"),
                limit(PAGE_SIZE),
              ),
            )
          : Promise.resolve(null);

        const userPromise =
          shouldLoadProfile && user
            ? getDocs(
                query(
                  collection(db, "lines"),
                  where("createdByUid", "==", user.uid),
                  orderBy("createdAt", "desc"),
                ),
              )
            : Promise.resolve(null);

        const pendingPromise = shouldLoadAdmin
          ? getDocs(
              query(
                collection(db, "lines"),
                where("status", "==", LINE_STATUS_PENDING),
                orderBy("createdAt", "desc"),
              ),
            )
          : Promise.resolve(null);

        const [
          candidateSnapshot,
          promotedSnapshot,
          userSnapshot,
          pendingSnapshot,
        ] = await Promise.all([
          candidatePromise,
          promotedPromise,
          userPromise,
          pendingPromise,
        ]);

        if (isCancelled) {
          return;
        }

        const nextCandidates = candidateSnapshot
          ? mapDocs(candidateSnapshot)
          : [];
        const nextPromoted = promotedSnapshot ? mapDocs(promotedSnapshot) : [];

        setCandidateLines(
          shouldLoadCandidates ? sortLines(nextCandidates) : [],
        );
        setPromotedLines(shouldLoadPromoted ? nextPromoted : []);
        setPendingLines(
          shouldLoadAdmin && pendingSnapshot ? mapDocs(pendingSnapshot) : [],
        );
        setCandidateCursor(
          candidateSnapshot?.docs.length
            ? candidateSnapshot.docs[candidateSnapshot.docs.length - 1]
            : null,
        );
        setPromotedCursor(
          promotedSnapshot?.docs.length
            ? promotedSnapshot.docs[promotedSnapshot.docs.length - 1]
            : null,
        );
        setHasMoreCandidates(
          shouldLoadCandidates && candidateSnapshot
            ? candidateSnapshot.docs.length === PAGE_SIZE
            : true,
        );
        setHasMorePromoted(
          shouldLoadPromoted && promotedSnapshot
            ? promotedSnapshot.docs.length === PAGE_SIZE
            : true,
        );
        setUserLines(
          shouldLoadProfile && userSnapshot ? mapDocs(userSnapshot) : [],
        );
        setIsBoardLoading(false);
      } catch (error) {
        console.error("Failed to load board.", error);
        if (!isCancelled) {
          setBoardError(
            "Could not load ideas from Firestore. Check rules, indexes, and admin access.",
          );
          setIsBoardLoading(false);
        }
      }
    }

    loadInitialBoard();

    return () => {
      isCancelled = true;
    };
  }, [activeBoardView, boardEnabled, isAdmin, user]);

  useEffect(() => {
    let isCancelled = false;

    async function loadVotes() {
      if (!db || !user || !boardEnabled || activeBoardView !== "candidates") {
        setVotes({});
        return;
      }

      const nextVotes = {};

      await Promise.all(
        candidateLines.map(async (line) => {
          const voteRef = doc(db, "lines", line.id, "votes", user.uid);
          const voteSnapshot = await getDoc(voteRef);

          if (voteSnapshot.exists()) {
            nextVotes[line.id] = voteSnapshot.data().value;
          }
        }),
      );

      if (!isCancelled) {
        setVotes(nextVotes);
      }
    }

    loadVotes().catch((error) => {
      console.error("Failed to load user votes.", error);

      if (!isCancelled) {
        setVotes({});
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [activeBoardView, boardEnabled, candidateLines, user]);

  async function submitLine(submission) {
    if (!db || !user) {
      return {
        ok: false,
        message: "Sign in before submitting to the board.",
        duplicateWarning: "",
        existingLineRef: null,
      };
    }

    const validationMessage = validateLineSubmission(submission);

    if (validationMessage) {
      return {
        ok: false,
        message: validationMessage,
        duplicateWarning: "",
        existingLineRef: null,
      };
    }

    const text = submission.text.trim();
    const { fingerprint, normalizedText } = await createLineFingerprint(text);
    const lineRef = doc(db, "lines", fingerprint);
    const timestamp = Date.now();
    const authorName = user.displayName?.trim() || "";
    const displayNameValidation = validateDisplayName(authorName);

    if (displayNameValidation) {
      return {
        ok: false,
        message:
          "Set a clean display name in your profile before sending ideas.",
        duplicateWarning: "",
        existingLineRef: null,
      };
    }

    try {
      await runTransaction(db, async (transaction) => {
        const lineSnapshot = await transaction.get(lineRef);

        if (lineSnapshot.exists()) {
          throw new Error("This line already exists on the board.");
        }

        transaction.set(lineRef, {
          text,
          normalizedText,
          fingerprint,
          category: submission.category,
          createdByUid: user.uid,
          createdByName: authorName,
          score: 0,
          upvoteCount: 0,
          createdAt: timestamp,
          updatedAt: timestamp,
          status: LINE_STATUS_PENDING,
          moderatedAt: null,
          moderatedByUid: null,
          moderationReason: null,
          promoted: false,
          promotedAt: null,
          promotionScore: null,
        });
      });

      return {
        ok: true,
        message: "Sent. We will review it before it goes live.",
        duplicateWarning: "",
        existingLineRef: null,
      };
    } catch (error) {
      console.error("Failed to submit line.", error);

      return {
        ok: false,
        message:
          error.message === "This line already exists on the board."
            ? "Looks like this idea is already on IceBreaker."
            : error.code === "permission-denied"
              ? "Your account could not send that idea yet. Please log out, log back in, and try again."
              : "That did not go through. Please try again in a moment.",
        duplicateWarning:
          error.message === "This line already exists on the board."
            ? "We already have this one."
            : "",
        existingLineRef: fingerprint,
      };
    }
  }

  async function voteOnLine(lineId) {
    if (!db || !user) {
      return {
        ok: false,
        message: "Sign in before voting.",
      };
    }

    const lineRef = doc(db, "lines", lineId);
    const voteRef = doc(db, "lines", lineId, "votes", user.uid);
    const optimisticCurrentVote = votes[lineId] || 0;

    try {
      await runTransaction(db, async (transaction) => {
        const lineSnapshot = await transaction.get(lineRef);
        const voteSnapshot = await transaction.get(voteRef);

        if (!lineSnapshot.exists()) {
          throw new Error("This line no longer exists.");
        }

        const lineData = lineSnapshot.data();

        if (
          lineData.status !== LINE_STATUS_APPROVED ||
          lineData.promoted === true
        ) {
          throw new Error("This line is not open for voting.");
        }

        const currentVote = voteSnapshot.exists()
          ? voteSnapshot.data().value
          : 0;
        const nextVote = currentVote === 1 ? 0 : 1;
        const scoreDelta = nextVote - currentVote;
        const nextScore = (lineData.score || 0) + scoreDelta;
        const timestamp = Date.now();

        transaction.update(lineRef, {
          score: nextScore,
          upvoteCount: (lineData.upvoteCount || 0) + scoreDelta,
          updatedAt: timestamp,
          status: LINE_STATUS_APPROVED,
          moderatedAt: lineData.moderatedAt || null,
          moderatedByUid: lineData.moderatedByUid || null,
          moderationReason: lineData.moderationReason || null,
          promoted: nextScore >= PROMOTION_THRESHOLD,
          promotedAt:
            nextScore >= PROMOTION_THRESHOLD
              ? lineData.promotedAt || timestamp
              : null,
          promotionScore: nextScore >= PROMOTION_THRESHOLD ? nextScore : null,
        });

        if (nextVote === 0) {
          transaction.delete(voteRef);
        } else {
          transaction.set(voteRef, {
            value: nextVote,
            updatedAt: timestamp,
          });
        }
      });

      setVotes((currentVotes) => {
        const currentVote = currentVotes[lineId] || 0;
        const nextVote = currentVote === 1 ? 0 : 1;

        if (nextVote === 0) {
          const { [lineId]: removedVote, ...restVotes } = currentVotes;
          void removedVote;
          return restVotes;
        }

        return {
          ...currentVotes,
          [lineId]: nextVote,
        };
      });

      setCandidateLines((currentLines) =>
        sortLines(
          currentLines
            .map((line) => {
              if (line.id !== lineId) {
                return line;
              }

              const currentVote = optimisticCurrentVote;
              const nextVote = currentVote === 1 ? 0 : 1;
              const scoreDelta = nextVote - currentVote;
              const nextScore = (line.score || 0) + scoreDelta;

              if (nextScore >= PROMOTION_THRESHOLD) {
                return null;
              }

              return {
                ...line,
                score: nextScore,
                upvoteCount: (line.upvoteCount || 0) + scoreDelta,
              };
            })
            .filter(Boolean),
        ),
      );

      return { ok: true, message: "" };
    } catch (error) {
      console.error("Failed to vote on line.", error);

      return {
        ok: false,
        message:
          error.message === "This line is not open for voting."
            ? error.message
            : "Vote failed. Check your Firebase config and Firestore rules.",
      };
    }
  }

  async function moderateLine(lineId, nextStatus, moderationReason = "") {
    if (!db || !user || !isAdmin) {
      return {
        ok: false,
        message: "Admin access is required for moderation.",
      };
    }

    if (![LINE_STATUS_APPROVED, LINE_STATUS_REJECTED].includes(nextStatus)) {
      return {
        ok: false,
        message: "That moderation action is not supported.",
      };
    }

    const lineRef = doc(db, "lines", lineId);
    const timestamp = Date.now();
    const trimmedReason = moderationReason.trim();

    try {
      await runTransaction(db, async (transaction) => {
        const lineSnapshot = await transaction.get(lineRef);

        if (!lineSnapshot.exists()) {
          throw new Error("This line no longer exists.");
        }

        const lineData = lineSnapshot.data();

        if (lineData.status !== LINE_STATUS_PENDING) {
          throw new Error("Only pending lines can be moderated.");
        }

        transaction.update(lineRef, {
          status: nextStatus,
          updatedAt: timestamp,
          moderatedAt: timestamp,
          moderatedByUid: user.uid,
          moderationReason:
            nextStatus === LINE_STATUS_REJECTED && trimmedReason
              ? trimmedReason
              : null,
          promoted: false,
          promotedAt: null,
          promotionScore: null,
        });
      });

      setPendingLines((currentLines) =>
        currentLines.filter((line) => line.id !== lineId),
      );

      return {
        ok: true,
        message:
          nextStatus === LINE_STATUS_APPROVED
            ? "Idea approved."
            : "Idea rejected.",
      };
    } catch (error) {
      console.error("Failed to moderate line.", error);

      return {
        ok: false,
        message:
          error.message === "Only pending lines can be moderated."
            ? error.message
            : "Moderation failed. Check Firestore rules and admin access.",
      };
    }
  }

  async function lookupExistingLine(existingLineRef) {
    if (!db || !existingLineRef) {
      return null;
    }

    try {
      const lineRef = doc(db, "lines", existingLineRef);
      const lineSnapshot = await getDoc(lineRef);

      if (!lineSnapshot.exists()) {
        return null;
      }

      return {
        collection: "lines",
        id: lineSnapshot.id,
        promoted: Boolean(lineSnapshot.data().promoted),
        status: lineSnapshot.data().status || LINE_STATUS_PENDING,
      };
    } catch (error) {
      console.error("Failed to look up existing line.", error);
      return null;
    }
  }

  async function getLineById(lineId) {
    if (!db || !lineId) {
      return null;
    }

    try {
      const lineRef = doc(db, "lines", lineId);
      const lineSnapshot = await getDoc(lineRef);

      if (!lineSnapshot.exists()) {
        return null;
      }

      return {
        id: lineSnapshot.id,
        ...lineSnapshot.data(),
      };
    } catch (error) {
      console.error("Failed to load line.", error);
      return null;
    }
  }

  async function getPublicProfileLines(profileId) {
    if (!db || !profileId) {
      return [];
    }

    try {
      const profileQuery = query(
        collection(db, "lines"),
        where("createdByUid", "==", profileId),
        where("status", "==", LINE_STATUS_APPROVED),
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocs(profileQuery);

      return mapDocs(snapshot);
    } catch (error) {
      console.error("Failed to load public profile lines.", error);
      return [];
    }
  }

  async function loadMoreLines(type) {
    if (!db || !boardEnabled || isFetchingMore) {
      return;
    }

    const isCandidateFeed = type === "candidates";
    const cursor = isCandidateFeed ? candidateCursor : promotedCursor;
    const hasMore = isCandidateFeed ? hasMoreCandidates : hasMorePromoted;

    if (!cursor || !hasMore) {
      return;
    }

    setIsFetchingMore(true);

    try {
      const nextQuery = isCandidateFeed
        ? query(
            collection(db, "lines"),
            where("status", "==", LINE_STATUS_APPROVED),
            where("promoted", "==", false),
            orderBy("score", "desc"),
            orderBy("createdAt", "desc"),
            startAfter(cursor),
            limit(PAGE_SIZE),
          )
        : query(
            collection(db, "lines"),
            where("status", "==", LINE_STATUS_APPROVED),
            where("promoted", "==", true),
            orderBy("promotedAt", "desc"),
            startAfter(cursor),
            limit(PAGE_SIZE),
          );
      const snapshot = await getDocs(nextQuery);
      const nextLines = mapDocs(snapshot);

      if (isCandidateFeed) {
        setCandidateLines((currentLines) =>
          sortLines([...currentLines, ...nextLines]),
        );
        setCandidateCursor(
          snapshot.docs.length
            ? snapshot.docs[snapshot.docs.length - 1]
            : cursor,
        );
        setHasMoreCandidates(snapshot.docs.length === PAGE_SIZE);
      } else {
        setPromotedLines((currentLines) => [...currentLines, ...nextLines]);
        setPromotedCursor(
          snapshot.docs.length
            ? snapshot.docs[snapshot.docs.length - 1]
            : cursor,
        );
        setHasMorePromoted(snapshot.docs.length === PAGE_SIZE);
      }
    } catch (error) {
      console.error("Failed to load more lines.", error);
      setBoardError("Could not load more ideas from Firestore.");
    } finally {
      setIsFetchingMore(false);
    }
  }

  return {
    boardError,
    candidateLines,
    getLineById,
    getPublicProfileLines,
    hasMoreCandidates,
    hasMorePromoted,
    isBoardLoading,
    isFetchingMore,
    loadMoreLines,
    lookupExistingLine,
    moderateLine,
    pendingLines,
    promotedLines,
    submitLine,
    userLines,
    votes,
    voteOnLine,
  };
}

export default useCommunityBoard;
