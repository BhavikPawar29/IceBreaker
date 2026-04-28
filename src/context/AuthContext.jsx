import { createContext, useEffect, useState } from "react";
import {
  fetchSignInMethodsForEmail,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  appleProvider,
  auth,
  db,
  facebookProvider,
  firebaseConfigReady,
  googleProvider,
} from "../lib/firebase";

const AuthContext = createContext(null);

const PROVIDER_LABELS = {
  "apple.com": "Apple",
  "facebook.com": "Facebook",
  "google.com": "Google",
};

function formatExistingProvider(methods) {
  const providerLabel = methods
    .map((method) => PROVIDER_LABELS[method])
    .find(Boolean);

  return providerLabel || "the provider you used earlier";
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(!firebaseConfigReady);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRoleReady, setIsRoleReady] = useState(!firebaseConfigReady);

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

  async function signInWithConfiguredProvider(provider, providerKey) {
    ensureConfigured();

    if (!provider) {
      const unavailableError = new Error(
        `${PROVIDER_LABELS[providerKey]} sign-in is not configured yet.`,
      );
      unavailableError.code = "app/provider-not-configured";
      unavailableError.providerKey = providerKey;
      throw unavailableError;
    }

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      if (error?.code === "auth/account-exists-with-different-credential") {
        const email = error.customData?.email || "";
        const methods = email
          ? await fetchSignInMethodsForEmail(auth, email)
          : [];
        const mismatchError = new Error(
          `That email is already tied to ${formatExistingProvider(methods)}. Use that button instead.`,
        );
        mismatchError.code = "app/provider-mismatch";
        mismatchError.providerKey = providerKey;
        throw mismatchError;
      }

      if (
        error?.code === "auth/operation-not-allowed" ||
        error?.code === "auth/unauthorized-domain"
      ) {
        const unavailableError = new Error(
          `${PROVIDER_LABELS[providerKey]} sign-in is not ready yet. Ask the project owner to finish Firebase provider setup.`,
        );
        unavailableError.code = "app/provider-not-configured";
        unavailableError.providerKey = providerKey;
        throw unavailableError;
      }

      throw error;
    }
  }

  async function signInWithGoogle() {
    await signInWithConfiguredProvider(googleProvider, "google.com");
  }

  async function signInWithFacebook() {
    await signInWithConfiguredProvider(facebookProvider, "facebook.com");
  }

  async function signInWithApple() {
    await signInWithConfiguredProvider(appleProvider, "apple.com");
  }

  async function signOutUser() {
    if (!auth) {
      return;
    }

    await firebaseSignOut(auth);
  }

  const value = {
    authEnabled: firebaseConfigReady,
    isAdmin,
    isAuthReady,
    isRoleReady,
    signInWithApple,
    signInWithFacebook,
    signInWithGoogle,
    signOutUser,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };
