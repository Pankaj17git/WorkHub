import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  ConfirmationResult
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

/**
 * Setup invisible reCAPTCHA for Phone OTP verification
 */
export function setupRecaptcha(elementId: string) {
  if (typeof window === "undefined") return null;
  return new RecaptchaVerifier(auth, elementId, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA solved - allow signInWithPhoneNumber
    },
  });
}

/**
 * Send Phone OTP via Firebase Authentication
 */
export async function sendPhoneOtp(phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> {
  return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
}

/**
 * Send Email Link / OTP via Firebase Authentication
 */
export async function sendEmailOtpLink(email: string, actionCodeSettings: { url: string; handleCodeInApp: boolean }) {
  return await sendSignInLinkToEmail(auth, email, actionCodeSettings);
}

/**
 * Verify Email Link OTP
 */
export async function verifyEmailOtpLink(email: string, emailLink: string) {
  if (isSignInWithEmailLink(auth, emailLink)) {
    return await signInWithEmailLink(auth, email, emailLink);
  }
  throw new Error("Invalid email sign-in link");
}
