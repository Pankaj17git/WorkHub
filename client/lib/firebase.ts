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
 * Setup invisible or visible reCAPTCHA for Phone OTP verification
 */
export function setupRecaptcha(elementId: string = 'recaptcha-container') {
  if (typeof window === "undefined") return null;
  
  // Clear any existing window instance if present
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch (e) {
      // ignore
    }
  }

  const verifier = new RecaptchaVerifier(auth, elementId, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA solved - allow signInWithPhoneNumber
    },
    'expired-callback': () => {
      // Response expired - ask user to solve reCAPTCHA again.
    }
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Send Phone OTP via Firebase Authetnication SMS
 */
export async function sendPhoneOtp(phoneNumber: string, appVerifier: RecaptchaVerifier | null): Promise<ConfirmationResult> {
  if (!appVerifier) {
    throw new Error("reCAPTCHA verifier is not initialized or reCAPTCHA cannot run in this environment.");
  }
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber.replace(/\D/g, '')}`;
  return await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
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
