import { createContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, firebaseConfigReady, googleProvider } from "../lib/firebase";
import { reportError } from "../utils/reportError";

const AuthContext = createContext(null);

function normalizePrivateName(name) {
  return typeof name === "string" ? name.replace(/\s+/g, " ").trim() : "";
}

function getSafePrivateName(name) {
  const normalizedName = normalizePrivateName(name);

  if (
    normalizedName.length < 2 ||
    normalizedName.length > 40 ||
    !/^[a-zA-Z0-9 .'-]+$/.test(normalizedName)
  ) {
    return "IceBreaker member";
  }

  return normalizedName;
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(!firebaseConfigReady);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRoleReady, setIsRoleReady] = useState(!firebaseConfigReady);
  const [banInfo, setBanInfo] = useState(null);
  const [isBanReady, setIsBanReady] = useState(!firebaseConfigReady);

  useEffect(() => {
    if (!auth) {
      setIsAuthReady(true);
      setIsRoleReady(true);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsAuthReady(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadRole() {
      if (!db || !user) {
        if (!isCancelled) {
          setIsAdmin(false);
          setIsRoleReady(true);
        }
        return;
      }

      setIsRoleReady(false);

      try {
        const roleSnapshot = await getDoc(doc(db, "roles", user.uid));
        const nextIsAdmin =
          roleSnapshot.exists() && roleSnapshot.data().role === "admin";

        if (!isCancelled) {
          setIsAdmin(nextIsAdmin);
          setIsRoleReady(true);
        }
      } catch (error) {
        reportError("Failed to load role document.", error);

        if (!isCancelled) {
          setIsAdmin(false);
          setIsRoleReady(true);
        }
      }
    }

    loadRole();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let isCancelled = false;

    async function loadBanInfo() {
      if (!db || !user) {
        if (!isCancelled) {
          setBanInfo(null);
          setIsBanReady(true);
        }
        return;
      }

      setIsBanReady(false);

      try {
        const banSnapshot = await getDoc(doc(db, "bannedUsers", user.uid));
        const nextBanInfo = banSnapshot.exists() ? banSnapshot.data() : null;

        if (!isCancelled) {
          setBanInfo(nextBanInfo);
          setIsBanReady(true);
        }
      } catch (error) {
        reportError("Failed to load ban document.", error);

        if (!isCancelled) {
          setBanInfo(null);
          setIsBanReady(true);
        }
      }
    }

    loadBanInfo();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  function ensureConfigured() {
    if (!auth) {
      throw new Error(
        "Firebase auth is not configured yet. Add your VITE_FIREBASE_* values first.",
      );
    }
  }

  async function upsertUserProfile(nextUser, nameOverride = "") {
    if (!db || !nextUser) {
      return;
    }

    const displayName = getSafePrivateName(
      nameOverride || nextUser.displayName,
    );
    const timestamp = Date.now();

    try {
      await setDoc(
        doc(db, "userProfiles", nextUser.uid),
        {
          displayName,
          email: nextUser.email || "",
          updatedAt: timestamp,
        },
        { merge: true },
      );
    } catch (error) {
      reportError("Failed to save private user profile.", error);
    }
  }

  async function signInWithGoogle() {
    ensureConfigured();

    if (!googleProvider) {
      const unavailableError = new Error(
        "Google sign-in is not configured yet.",
      );
      unavailableError.code = "app/provider-not-configured";
      throw unavailableError;
    }

    try {
      const credential = await signInWithPopup(auth, googleProvider);
      await upsertUserProfile(credential.user);
    } catch (error) {
      if (
        error?.code === "auth/operation-not-allowed" ||
        error?.code === "auth/unauthorized-domain"
      ) {
        const unavailableError = new Error(
          "Google sign-in is not ready yet. Ask the project owner to finish Firebase setup.",
        );
        unavailableError.code = "app/provider-not-configured";
        throw unavailableError;
      }

      throw error;
    }
  }

  async function signInWithEmail(email, password) {
    ensureConfigured();
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );
    await upsertUserProfile(credential.user);
  }

  async function signUpWithEmail(email, password, displayName) {
    ensureConfigured();
    const normalizedName = normalizePrivateName(displayName);
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );
    await updateProfile(credential.user, { displayName: normalizedName });
    await upsertUserProfile(credential.user, normalizedName);
  }

  async function sendEmailPasswordReset(email) {
    ensureConfigured();
    await sendPasswordResetEmail(auth, email.trim());
  }

  async function signOutUser() {
    if (!auth) {
      return;
    }

    await firebaseSignOut(auth);
  }

  const value = {
    authEnabled: firebaseConfigReady,
    banInfo,
    isAdmin,
    isAuthReady,
    isBanReady,
    isRoleReady,
    sendEmailPasswordReset,
    signInWithEmail,
    signInWithGoogle,
    signUpWithEmail,
    signOutUser,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };
