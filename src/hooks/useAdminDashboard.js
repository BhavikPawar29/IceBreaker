import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  LINE_STATUS_APPROVED,
  LINE_STATUS_PENDING,
  LINE_STATUS_REJECTED,
  LINE_STATUS_REMOVED,
} from "../constants/lineStatuses";
import { db } from "../lib/firebase";

const ADMIN_PAGE_SIZE = 25;

function mapDocs(snapshot) {
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

function getLastDoc(snapshot) {
  return snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null;
}

function emptyStats() {
  return {
    approved: 0,
    banned: 0,
    pending: 0,
    promoted: 0,
    rejected: 0,
    removed: 0,
    saves: 0,
    users: 0,
  };
}

function mergeById(currentItems, nextItems) {
  const nextMap = new Map(currentItems.map((item) => [item.id, item]));

  nextItems.forEach((item) => {
    nextMap.set(item.id, item);
  });

  return [...nextMap.values()];
}

async function getQueryCount(nextQuery) {
  const snapshot = await getCountFromServer(nextQuery);
  return snapshot.data().count || 0;
}

function useAdminDashboard(user, isAdmin, enabled) {
  const userUid = user?.uid || "";
  const [lines, setLines] = useState([]);
  const [reviewLines, setReviewLines] = useState([]);
  const [users, setUsers] = useState([]);
  const [bans, setBans] = useState([]);
  const [lineCursor, setLineCursor] = useState(null);
  const [reviewCursor, setReviewCursor] = useState(null);
  const [userCursor, setUserCursor] = useState(null);
  const [banCursor, setBanCursor] = useState(null);
  const [hasMoreLines, setHasMoreLines] = useState(false);
  const [hasMoreReview, setHasMoreReview] = useState(false);
  const [hasMoreUsers, setHasMoreUsers] = useState(false);
  const [hasMoreBans, setHasMoreBans] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState(emptyStats);

  function resetState() {
    setLines([]);
    setReviewLines([]);
    setUsers([]);
    setBans([]);
    setLineCursor(null);
    setReviewCursor(null);
    setUserCursor(null);
    setBanCursor(null);
    setHasMoreLines(false);
    setHasMoreReview(false);
    setHasMoreUsers(false);
    setHasMoreBans(false);
    setStats(emptyStats());
  }

  function canLoad() {
    return Boolean(db && userUid && isAdmin && enabled);
  }

  function buildLinesQuery({
    category = "all",
    cursor = null,
    pageSize = ADMIN_PAGE_SIZE,
    status = "all",
  } = {}) {
    const constraints = [];

    if (status !== "all") {
      constraints.push(where("status", "==", status));
    }

    if (category !== "all") {
      constraints.push(where("category", "==", category));
    }

    constraints.push(orderBy("createdAt", "desc"));

    if (cursor) {
      constraints.push(startAfter(cursor));
    }

    constraints.push(limit(pageSize));

    return query(collection(db, "lines"), ...constraints);
  }

  async function refreshStats(nextLines = []) {
    if (!db) {
      setStats(emptyStats());
      return;
    }

    const lineCollection = collection(db, "lines");

    const [pending, approved, rejected, removed, promoted, usersCount, banned] =
      await Promise.all([
        getQueryCount(
          query(lineCollection, where("status", "==", LINE_STATUS_PENDING)),
        ),
        getQueryCount(
          query(lineCollection, where("status", "==", LINE_STATUS_APPROVED)),
        ),
        getQueryCount(
          query(lineCollection, where("status", "==", LINE_STATUS_REJECTED)),
        ),
        getQueryCount(
          query(lineCollection, where("status", "==", LINE_STATUS_REMOVED)),
        ),
        getQueryCount(query(lineCollection, where("promoted", "==", true))),
        getQueryCount(query(collection(db, "userProfiles"))),
        getQueryCount(query(collection(db, "bannedUsers"))),
      ]);

    setStats({
      approved,
      banned,
      pending,
      promoted,
      rejected,
      removed,
      saves: nextLines.reduce(
        (total, line) => total + (line.upvoteCount || 0),
        0,
      ),
      users: usersCount,
    });
  }

  async function loadReview({ append = false } = {}) {
    if (!canLoad()) {
      return;
    }

    const snapshot = await getDocs(
      buildLinesQuery({
        cursor: append ? reviewCursor : null,
        status: LINE_STATUS_PENDING,
      }),
    );
    const nextLines = mapDocs(snapshot);

    setReviewLines((currentLines) =>
      append ? mergeById(currentLines, nextLines) : nextLines,
    );
    setReviewCursor(getLastDoc(snapshot));
    setHasMoreReview(snapshot.docs.length === ADMIN_PAGE_SIZE);
  }

  async function loadLines({
    append = false,
    category = "all",
    includeStats = false,
    status = "all",
  } = {}) {
    if (!canLoad()) {
      return;
    }

    const snapshot = await getDocs(
      buildLinesQuery({
        category,
        cursor: append ? lineCursor : null,
        status,
      }),
    );
    const nextLines = mapDocs(snapshot);

    setLines((currentLines) =>
      append ? mergeById(currentLines, nextLines) : nextLines,
    );
    setLineCursor(getLastDoc(snapshot));
    setHasMoreLines(snapshot.docs.length === ADMIN_PAGE_SIZE);

    if (includeStats) {
      await refreshStats(append ? mergeById(lines, nextLines) : nextLines);
    }
  }

  async function loadUsers({ append = false } = {}) {
    if (!canLoad()) {
      return;
    }

    const snapshot = await getDocs(
      query(
        collection(db, "userProfiles"),
        orderBy("updatedAt", "desc"),
        ...(append && userCursor ? [startAfter(userCursor)] : []),
        limit(ADMIN_PAGE_SIZE),
      ),
    );
    const nextUsers = mapDocs(snapshot);

    setUsers((currentUsers) =>
      append ? mergeById(currentUsers, nextUsers) : nextUsers,
    );
    setUserCursor(getLastDoc(snapshot));
    setHasMoreUsers(snapshot.docs.length === ADMIN_PAGE_SIZE);
  }

  async function loadBans({ append = false } = {}) {
    if (!canLoad()) {
      return;
    }

    const snapshot = await getDocs(
      query(
        collection(db, "bannedUsers"),
        orderBy("createdAt", "desc"),
        ...(append && banCursor ? [startAfter(banCursor)] : []),
        limit(ADMIN_PAGE_SIZE),
      ),
    );
    const nextBans = mapDocs(snapshot);

    setBans((currentBans) =>
      append ? mergeById(currentBans, nextBans) : nextBans,
    );
    setBanCursor(getLastDoc(snapshot));
    setHasMoreBans(snapshot.docs.length === ADMIN_PAGE_SIZE);
  }

  async function refresh({ category = "all", status = "all" } = {}) {
    if (!canLoad()) {
      resetState();
      setIsLoading(false);
      setError("");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await Promise.all([
        loadReview({ append: false }),
        loadLines({ append: false, category, includeStats: true, status }),
        loadUsers({ append: false }),
        loadBans({ append: false }),
      ]);
    } catch (nextError) {
      console.error("Failed to load admin dashboard.", nextError);
      setError("Could not load admin data. Check rules and indexes.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadMoreReview() {
    if (!hasMoreReview || loadingMore) {
      return;
    }

    setLoadingMore("review");
    setError("");

    try {
      await loadReview({ append: true });
    } catch (nextError) {
      console.error("Failed to load more review lines.", nextError);
      setError("Could not load more pending lines.");
    } finally {
      setLoadingMore("");
    }
  }

  async function loadMoreLines({ category = "all", status = "all" } = {}) {
    if (!hasMoreLines || loadingMore) {
      return;
    }

    setLoadingMore("lines");
    setError("");

    try {
      await loadLines({ append: true, category, status });
    } catch (nextError) {
      console.error("Failed to load more lines.", nextError);
      setError("Could not load more lines.");
    } finally {
      setLoadingMore("");
    }
  }

  async function loadMoreUsers() {
    if (!hasMoreUsers || loadingMore) {
      return;
    }

    setLoadingMore("users");
    setError("");

    try {
      await loadUsers({ append: true });
    } catch (nextError) {
      console.error("Failed to load more users.", nextError);
      setError("Could not load more users.");
    } finally {
      setLoadingMore("");
    }
  }

  async function loadMoreBans() {
    if (!hasMoreBans || loadingMore) {
      return;
    }

    setLoadingMore("bans");
    setError("");

    try {
      await loadBans({ append: true });
    } catch (nextError) {
      console.error("Failed to load more bans.", nextError);
      setError("Could not load more bans.");
    } finally {
      setLoadingMore("");
    }
  }

  useEffect(
    function loadAdminDashboardWhenEnabled() {
      refresh();
      // refresh is intentionally not a dependency; enabled/auth changes define reloads.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [enabled, isAdmin, userUid],
  );

  const allKnownLines = useMemo(
    () => mergeById(lines, reviewLines),
    [lines, reviewLines],
  );

  const banMap = useMemo(
    () =>
      bans.reduce((currentMap, ban) => {
        currentMap[ban.id] = ban;
        return currentMap;
      }, {}),
    [bans],
  );

  const userMap = useMemo(
    () =>
      users.reduce((currentMap, nextUser) => {
        currentMap[nextUser.id] = nextUser;
        return currentMap;
      }, {}),
    [users],
  );

  const lineCountsByUser = useMemo(
    () =>
      allKnownLines.reduce((counts, line) => {
        const uid = line.createdByUid;

        if (!uid) {
          return counts;
        }

        if (!counts[uid]) {
          counts[uid] = {
            approved: 0,
            pending: 0,
            rejected: 0,
            removed: 0,
            total: 0,
          };
        }

        const status = line.status || LINE_STATUS_PENDING;

        counts[uid].total += 1;
        counts[uid][status] = (counts[uid][status] || 0) + 1;
        return counts;
      }, {}),
    [allKnownLines],
  );

  async function changeLineStatus(lineId, nextStatus, moderationReason = "") {
    if (!db || !user || !isAdmin) {
      return { ok: false, message: "Admin access is required." };
    }

    const allowedStatuses = [
      LINE_STATUS_PENDING,
      LINE_STATUS_APPROVED,
      LINE_STATUS_REJECTED,
      LINE_STATUS_REMOVED,
    ];

    if (!allowedStatuses.includes(nextStatus)) {
      return { ok: false, message: "That status is not supported." };
    }

    const timestamp = Date.now();
    const trimmedReason = moderationReason.trim();

    try {
      const lineRef = doc(db, "lines", lineId);
      let updatedLine = null;

      await runTransaction(db, async (transaction) => {
        const lineSnapshot = await transaction.get(lineRef);

        if (!lineSnapshot.exists()) {
          throw new Error("Line no longer exists.");
        }

        const update = {
          status: nextStatus,
          updatedAt: timestamp,
          moderatedAt: nextStatus === LINE_STATUS_PENDING ? null : timestamp,
          moderatedByUid: nextStatus === LINE_STATUS_PENDING ? null : user.uid,
          moderationReason:
            nextStatus === LINE_STATUS_REJECTED ||
            nextStatus === LINE_STATUS_REMOVED
              ? trimmedReason || null
              : null,
          promoted: false,
          promotedAt: null,
          promotionScore: null,
        };

        updatedLine = {
          id: lineSnapshot.id,
          ...lineSnapshot.data(),
          ...update,
        };

        transaction.update(lineRef, update);
      });

      const applyUpdate = (currentLines) =>
        currentLines
          .map((line) =>
            line.id === lineId ? { ...line, ...updatedLine } : line,
          )
          .filter(
            (line) =>
              !(line.id === lineId && nextStatus !== LINE_STATUS_PENDING),
          );

      setReviewLines(applyUpdate);
      setLines((currentLines) =>
        currentLines.map((line) =>
          line.id === lineId ? { ...line, ...updatedLine } : line,
        ),
      );
      await refreshStats(
        lines.map((line) =>
          line.id === lineId ? { ...line, ...updatedLine } : line,
        ),
      );

      return { ok: true, message: "Line updated." };
    } catch (nextError) {
      console.error("Failed to update line status.", nextError);
      return { ok: false, message: "Line update failed. Check admin rules." };
    }
  }

  async function banUser(uid, reason = "") {
    if (!db || !user || !isAdmin || !uid) {
      return { ok: false, message: "Admin access is required." };
    }

    const timestamp = Date.now();
    const nextBan = {
      createdAt: timestamp,
      createdByUid: user.uid,
      reason: reason.trim() || "Manual admin ban",
    };

    try {
      await setDoc(doc(db, "bannedUsers", uid), nextBan);
      setBans((currentBans) => [
        { id: uid, ...nextBan },
        ...currentBans.filter((ban) => ban.id !== uid),
      ]);
      setStats((currentStats) => ({
        ...currentStats,
        banned: currentStats.banned + (banMap[uid] ? 0 : 1),
      }));
      return { ok: true, message: "User banned." };
    } catch (nextError) {
      console.error("Failed to ban user.", nextError);
      return { ok: false, message: "Ban failed. Check admin rules." };
    }
  }

  async function unbanUser(uid) {
    if (!db || !user || !isAdmin || !uid) {
      return { ok: false, message: "Admin access is required." };
    }

    try {
      await deleteDoc(doc(db, "bannedUsers", uid));
      setBans((currentBans) => currentBans.filter((ban) => ban.id !== uid));
      setStats((currentStats) => ({
        ...currentStats,
        banned: Math.max(0, currentStats.banned - (banMap[uid] ? 1 : 0)),
      }));
      return { ok: true, message: "User unbanned." };
    } catch (nextError) {
      console.error("Failed to unban user.", nextError);
      return { ok: false, message: "Unban failed. Check admin rules." };
    }
  }

  async function updateBanReason(uid, reason) {
    if (!db || !user || !isAdmin || !uid) {
      return { ok: false, message: "Admin access is required." };
    }

    try {
      await updateDoc(doc(db, "bannedUsers", uid), {
        reason: reason.trim() || "Manual admin ban",
      });
      setBans((currentBans) =>
        currentBans.map((ban) =>
          ban.id === uid
            ? { ...ban, reason: reason.trim() || "Manual admin ban" }
            : ban,
        ),
      );
      return { ok: true, message: "Ban updated." };
    } catch (nextError) {
      console.error("Failed to update ban.", nextError);
      return { ok: false, message: "Ban update failed. Check admin rules." };
    }
  }

  return {
    allKnownLines,
    banMap,
    banUser,
    bans,
    changeLineStatus,
    error,
    hasMoreBans,
    hasMoreLines,
    hasMoreReview,
    hasMoreUsers,
    isLoading,
    lineCountsByUser,
    lines,
    loadMoreBans,
    loadMoreLines,
    loadMoreReview,
    loadMoreUsers,
    loadingMore,
    refresh,
    reloadLines: ({ category = "all", status = "all" } = {}) =>
      loadLines({ append: false, category, status }),
    reviewLines,
    stats,
    unbanUser,
    updateBanReason,
    userMap,
    users,
  };
}

export default useAdminDashboard;
