import { getApp, getApps, initializeApp } from "firebase/app";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "firebase/app-check";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  ...(measurementId ? { measurementId } : {}),
};

export const firebaseConfigReady = Object.values(firebaseConfig).every(Boolean);
export const appCheckSiteKey =
  import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY || "";
const appCheckDebugToken = import.meta.env.DEV
  ? import.meta.env.VITE_APP_CHECK_DEBUG_TOKEN || ""
  : "";
const hasFirebaseWebAppId = /^1:\d+:web:[a-zA-Z0-9]+/.test(
  firebaseConfig.appId || "",
);
const shouldEnableAppCheck =
  import.meta.env.VITE_ENABLE_APP_CHECK === "true" &&
  Boolean(appCheckSiteKey) &&
  hasFirebaseWebAppId;
let appCheckInitialized = false;

const app = firebaseConfigReady
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = auth ? new GoogleAuthProvider() : null;
export const analyticsReady =
  app && typeof window !== "undefined"
    ? isSupported()
        .then((supported) => (supported ? getAnalytics(app) : null))
        .catch((error) => {
          console.warn(
            "Firebase Analytics is unavailable in this browser.",
            error,
          );
          return null;
        })
    : Promise.resolve(null);

googleProvider?.setCustomParameters({
  prompt: "select_account",
});

if (
  app &&
  shouldEnableAppCheck &&
  typeof window !== "undefined" &&
  !appCheckInitialized
) {
  if (appCheckDebugToken) {
    window.FIREBASE_APPCHECK_DEBUG_TOKEN =
      appCheckDebugToken === "true" ? true : appCheckDebugToken;
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
  appCheckInitialized = true;
} else if (
  import.meta.env.DEV &&
  app &&
  appCheckSiteKey &&
  typeof window !== "undefined" &&
  !hasFirebaseWebAppId
) {
  console.warn(
    "Firebase App Check is disabled because VITE_FIREBASE_APP_ID is not a Firebase Web App ID. Use the app id from Firebase Project settings, not the G- measurement id.",
  );
}
