import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  where,
} from "firebase/firestore";
import { defaultBoardState } from "../data/seedLines";
import { db, firebaseConfigReady } from "../lib/firebase";
import { createLineFingerprint } from "../utils/textNormalization";
import { sortLines } from "../utils/board";

function useCommunityBoard(user) {
  const [candidateLines, setCandidateLines] = useState(
    defaultBoardState.candidateLines || [],
  );
  const [approvedLines, setApprovedLines] = useState(
    defaultBoardState.approvedLines || [],
  );
  const [votes, setVotes] = useState(defaultBoardState.votes || {});
  const [isBoardLoading, setIsBoardLoading] = useState(firebaseConfigReady);
  const [isApprovedLoading, setIsApprovedLoading] =
    useState(firebaseConfigReady);
  const [boardError, setBoardError] = useState("");

  useEffect(() => {
    if (!db) {
      setCandidateLines(defaultBoardState.candidateLines);
      setApprovedLines(defaultBoardState.approvedLines);
      setVotes(defaultBoardState.votes);
      setIsBoardLoading(false);
      setIsApprovedLoading(false);
      return undefined;
    }

    const candidateQuery = query(
      collection(db, "candidate_lines"),
      where("status", "==", "candidate"),
      orderBy("score", "desc"),
    );

    const unsubscribe = onSnapshot(
      candidateQuery,
      (snapshot) => {
        const nextLines = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));
        setCandidateLines(sortLines(nextLines));
        setIsBoardLoading(false);
        setBoardError("");
      },
      (error) => {
        console.error("Failed to load candidate lines.", error);
        setBoardError("Could not load candidate lines from Firestore.");
        setIsBoardLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!db) {
      setApprovedLines(defaultBoardState.approvedLines);
      setIsApprovedLoading(false);
      return undefined;
    }

    const approvedQuery = query(
      collection(db, "approved_lines"),
      orderBy("promotedAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      approvedQuery,
      (snapshot) => {
        const nextLines = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));
        setApprovedLines(nextLines);
        setIsApprovedLoading(false);
      },
      (error) => {
        console.error("Failed to load approved lines.", error);
        setBoardError("Could not load approved lines from Firestore.");
        setIsApprovedLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadVotes() {
      if (!db || !user) {
        setVotes({});
        return;
      }

      const nextVotes = {};

      await Promise.all(
        candidateLines.map(async (line) => {
          const voteRef = doc(
            db,
            "candidate_lines",
            line.id,
            "votes",
            user.uid,
          );
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
  }, [candidateLines, user]);

  async function submitLine(submission) {
    if (!db || !user) {
      return {
        ok: false,
        message: "Sign in with Google before submitting to the board.",
        duplicateWarning: "",
        existingLineRef: null,
      };
    }

    const { fingerprint, normalizedText } = await createLineFingerprint(
      submission.text,
    );
    const fingerprintRef = doc(db, "line_fingerprints", fingerprint);
    const lineRef = doc(collection(db, "candidate_lines"));
    const voteRef = doc(db, "candidate_lines", lineRef.id, "votes", user.uid);
    const timestamp = Date.now();
    const authorName =
      submission.author ||
      user.displayName ||
      user.email?.split("@")[0] ||
      "anonymous sketcher";

    try {
      const result = await runTransaction(db, async (transaction) => {
        const fingerprintSnapshot = await transaction.get(fingerprintRef);
        const fingerprintData = fingerprintSnapshot.exists()
          ? fingerprintSnapshot.data()
          : null;
        const existingLineRef =
          fingerprintData?.approvedLineId ||
          fingerprintData?.latestLineId ||
          null;
        const duplicateWarning = fingerprintSnapshot.exists()
          ? "This line already exists or is very close to an existing one."
          : "";

        transaction.set(lineRef, {
          text: submission.text.trim(),
          normalizedText,
          fingerprint,
          category: submission.category,
          createdByUid: user.uid,
          createdByName: authorName,
          status: "candidate",
          score: 1,
          upvoteCount: 1,
          downvoteCount: 0,
          voteCountTotal: 1,
          createdAt: timestamp,
          updatedAt: timestamp,
          promotedAt: null,
          approvedLineId: null,
        });

        transaction.set(voteRef, {
          value: 1,
          updatedAt: timestamp,
        });

        transaction.set(
          fingerprintRef,
          {
            normalizedText,
            firstSeenAt: fingerprintData?.firstSeenAt || timestamp,
            latestLineId: lineRef.id,
            approvedLineId: fingerprintData?.approvedLineId || null,
            submissionCount: (fingerprintData?.submissionCount || 0) + 1,
          },
          { merge: true },
        );

        return {
          duplicateWarning,
          existingLineRef,
        };
      });

      return {
        ok: true,
        message: "Published. Your line is now live in Firestore.",
        duplicateWarning: result.duplicateWarning,
        existingLineRef: result.existingLineRef,
      };
    } catch (error) {
      console.error("Failed to submit line.", error);

      return {
        ok: false,
        message:
          "Publishing failed. Check your Firebase config and Firestore rules.",
        duplicateWarning: "",
        existingLineRef: null,
      };
    }
  }

  async function voteOnLine(lineId, direction) {
    if (!db || !user) {
      return {
        ok: false,
        message: "Sign in with Google before voting.",
      };
    }

    const lineRef = doc(db, "candidate_lines", lineId);
    const voteRef = doc(db, "candidate_lines", lineId, "votes", user.uid);

    try {
      await runTransaction(db, async (transaction) => {
        const lineSnapshot = await transaction.get(lineRef);
        const voteSnapshot = await transaction.get(voteRef);

        if (!lineSnapshot.exists()) {
          throw new Error("This line no longer exists.");
        }

        const lineData = lineSnapshot.data();

        if (lineData.status !== "candidate") {
          throw new Error("Promoted lines are read-only.");
        }

        const currentVote = voteSnapshot.exists()
          ? voteSnapshot.data().value
          : 0;
        const nextVote = currentVote === direction ? 0 : direction;
        const scoreDelta = nextVote - currentVote;
        const upvoteDelta =
          (nextVote === 1 ? 1 : 0) - (currentVote === 1 ? 1 : 0);
        const downvoteDelta =
          (nextVote === -1 ? 1 : 0) - (currentVote === -1 ? 1 : 0);
        const totalVoteDelta =
          (nextVote !== 0 ? 1 : 0) - (currentVote !== 0 ? 1 : 0);

        transaction.update(lineRef, {
          score: (lineData.score || 0) + scoreDelta,
          upvoteCount: (lineData.upvoteCount || 0) + upvoteDelta,
          downvoteCount: (lineData.downvoteCount || 0) + downvoteDelta,
          voteCountTotal: (lineData.voteCountTotal || 0) + totalVoteDelta,
          updatedAt: Date.now(),
        });

        if (nextVote === 0) {
          transaction.delete(voteRef);
        } else {
          transaction.set(voteRef, {
            value: nextVote,
            updatedAt: Date.now(),
          });
        }
      });

      setVotes((currentVotes) => {
        const currentVote = currentVotes[lineId] || 0;
        const nextVote = currentVote === direction ? 0 : direction;

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

      return { ok: true, message: "" };
    } catch (error) {
      console.error("Failed to vote on line.", error);

      return {
        ok: false,
        message:
          error.message === "Promoted lines are read-only."
            ? error.message
            : "Vote failed. Check your Firebase config and Firestore rules.",
      };
    }
  }

  async function lookupExistingLine(existingLineRef) {
    if (!db || !existingLineRef) {
      return null;
    }

    const approvedRef = doc(db, "approved_lines", existingLineRef);
    const approvedSnapshot = await getDoc(approvedRef);

    if (approvedSnapshot.exists()) {
      return { collection: "approved_lines", id: approvedSnapshot.id };
    }

    const candidateRef = doc(db, "candidate_lines", existingLineRef);
    const candidateSnapshot = await getDoc(candidateRef);

    if (candidateSnapshot.exists()) {
      return { collection: "candidate_lines", id: candidateSnapshot.id };
    }

    return null;
  }

  return {
    approvedLines,
    boardError,
    candidateLines,
    isApprovedLoading,
    isBoardLoading,
    lookupExistingLine,
    submitLine,
    votes,
    voteOnLine,
  };
}

export default useCommunityBoard;
