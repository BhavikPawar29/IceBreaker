import { createContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, firebaseConfigReady, googleProvider } from "../lib/firebase";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(!firebaseConfigReady);

  useEffect(() => {
    if (!auth) {
      setIsAuthReady(true);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsAuthReady(true);
    });

    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    if (!auth || !googleProvider) {
      throw new Error(
        "Firebase auth is not configured yet. Add your VITE_FIREBASE_* values first.",
      );
    }

    await signInWithPopup(auth, googleProvider);
  }

  async function signOutUser() {
    if (!auth) {
      return;
    }

    await firebaseSignOut(auth);
  }

  const value = {
    authEnabled: firebaseConfigReady,
    isAuthReady,
    signInWithGoogle,
    signOutUser,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export { AuthContext, AuthProvider };
