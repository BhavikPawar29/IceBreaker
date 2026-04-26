import { createContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth, db, firebaseConfigReady, googleProvider } from "../lib/firebase";
import {
  normalizeDisplayName,
  validateDisplayName,
} from "../utils/profileValidation";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(!firebaseConfigReady);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRoleReady, setIsRoleReady] = useState(!firebaseConfigReady);
  const [isCompletingEmailSignUp, setIsCompletingEmailSignUp] = useState(false);

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
        console.error("Failed to load role document.", error);

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

  function ensureConfigured() {
    if (!auth) {
      throw new Error(
        "Firebase auth is not configured yet. Add your VITE_FIREBASE_* values first.",
      );
    }
  }

  async function signInWithGoogle() {
    ensureConfigured();
    await signInWithPopup(auth, googleProvider);
  }

  async function signInWithEmail(email, password) {
    ensureConfigured();

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (
        error?.code === "auth/invalid-credential" ||
        error?.code === "auth/user-not-found" ||
        error?.code === "auth/wrong-password"
      ) {
        const methods = await fetchSignInMethodsForEmail(auth, email);

        if (!methods.length) {
          const missingAccountError = new Error(
            "No account exists for this email yet.",
          );
          missingAccountError.code = "app/account-not-found";
          throw missingAccountError;
        }

        const passwordMismatchError = new Error(
          "The password does not match this email.",
        );
        passwordMismatchError.code = "app/password-mismatch";
        throw passwordMismatchError;
      }

      throw error;
    }
  }

  async function signUpWithEmail(email, password, displayName) {
    ensureConfigured();
    const normalizedDisplayName = normalizeDisplayName(displayName);
    const displayNameValidation = validateDisplayName(normalizedDisplayName);

    if (displayNameValidation) {
      const error = new Error(displayNameValidation);
      error.code = "app/invalid-display-name";
      throw error;
    }

    setIsCompletingEmailSignUp(true);

    try {
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (normalizedDisplayName) {
        await updateProfile(credentials.user, {
          displayName: normalizedDisplayName,
        });
      }

      await firebaseSignOut(auth);
    } finally {
      setIsCompletingEmailSignUp(false);
    }
  }

  async function sendEmailPasswordReset(email) {
    ensureConfigured();
    await sendPasswordResetEmail(auth, email.trim());
  }

  async function updateDisplayName(displayName) {
    ensureConfigured();

    if (!auth.currentUser || !db) {
      throw new Error("You need to be signed in to change your name.");
    }

    const normalizedDisplayName = normalizeDisplayName(displayName);
    const displayNameValidation = validateDisplayName(normalizedDisplayName);

    if (displayNameValidation) {
      const error = new Error(displayNameValidation);
      error.code = "app/invalid-display-name";
      throw error;
    }

    await updateProfile(auth.currentUser, {
      displayName: normalizedDisplayName,
    });
    await auth.currentUser.getIdToken(true);

    const submittedLinesSnapshot = await getDocs(
      query(
        collection(db, "lines"),
        where("createdByUid", "==", auth.currentUser.uid),
      ),
    );

    if (!submittedLinesSnapshot.empty) {
      const batch = writeBatch(db);
      const timestamp = Date.now();

      submittedLinesSnapshot.docs.forEach((lineDoc) => {
        batch.update(lineDoc.ref, {
          createdByName: normalizedDisplayName,
          updatedAt: timestamp,
        });
      });

      await batch.commit();
    }

    setUser({
      ...auth.currentUser,
      displayName: normalizedDisplayName,
    });
  }

  async function signOutUser() {
    if (!auth) {
      return;
    }

    await firebaseSignOut(auth);
  }

  const value = {
    authEnabled: firebaseConfigReady,
    isCompletingEmailSignUp,
    isAdmin,
    isAuthReady,
    isRoleReady,
    signInWithEmail,
    signInWithGoogle,
    signOutUser,
    signUpWithEmail,
    sendEmailPasswordReset,
    updateDisplayName,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export { AuthContext, AuthProvider };
