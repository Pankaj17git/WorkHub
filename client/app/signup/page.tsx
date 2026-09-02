"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  MailCheck,
} from "lucide-react";
import OtpPinInput from "@/components/ui/OtpPinInput";
import AuthLayout from "@/components/auth/AuthLayout";
import { AuthRole } from "@/components/auth/RoleToggle";
import { saveSession, signupRedirectPath } from "@/lib/auth-client";

type Step = "FORM" | "OTP";

const ROLE_SUBTITLE: Record<AuthRole, string> = {
  CUSTOMER: "Book trusted local pros in a few taps.",
  WORKER: "Start getting matched with paid jobs nearby.",
};

function StepDots({ step }: { step: Step }) {
  return (
    <div
      className="wha-steps"
      aria-label={step === "FORM" ? "Step 1 of 2" : "Step 2 of 2"}
    >
      <span className="dot on" />
      <span className={`dot ${step === "OTP" ? "on" : ""}`} />
      <span>
        {step === "FORM"
          ? "Step 1 of 2 · Your details"
          : "Step 2 of 2 · Verify email"}
      </span>
    </div>
  );
}

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlRole = searchParams.get("role");

  const [role, setRole] = useState<AuthRole>(
    urlRole === "WORKER" ? "WORKER" : "CUSTOMER",
  );
  const [step, setStep] = useState<Step>("FORM");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otpValue, setOtpValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);

  useEffect(() => {
    if (urlRole === "WORKER" || urlRole === "CUSTOMER") {
      setRole(urlRole);
    }
  }, [urlRole]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password, role }),
      });
      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        setError(
          registerData.error ||
            "We couldn’t create your account. Please try again.",
        );
        setIsSubmitting(false);
        return;
      }

      const otpRes = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const otpData = await otpRes.json();

      if (!otpRes.ok) {
        setError(
          otpData.error ||
            "We couldn’t send your verification code. Please try again.",
        );
        setIsSubmitting(false);
        return;
      }

      if (otpData.emailNotice) setOtpNotice(otpData.emailNotice);

      setOtpValue("");
      setIsSubmitting(false);
      setStep("OTP");
    } catch {
      setError("Something went wrong on our end. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            "That code doesn’t match. Check your email and try again.",
        );
        setIsSubmitting(false);
        return;
      }

      const { token, user } = data;
      saveSession(token, user);

      // Workers finish setup in skills onboarding; customers go to the marketplace.
      router.push(signupRedirectPath(user.role));
    } catch {
      setError("Something went wrong on our end. Please try again.");
      setIsSubmitting(false);
    }
  };

  const backToForm = () => {
    setError(null);
    setStep("FORM");
  };

  return (
    <AuthLayout
      role={role}
      onRoleChange={setRole}
      mode="signup"
      showToggle={step === "FORM"}
      title={step === "FORM" ? "Create your account" : "Verify your email"}
      subtitle={
        step === "FORM"
          ? ROLE_SUBTITLE[role]
          : `Enter the 6-digit code we sent to ${email}.`
      }
      notice={<StepDots step={step} />}
      footer={
        step === "FORM" ? (
          <>
            Already have an account?{" "}
            <Link href={role === "WORKER" ? "/login?role=WORKER" : "/login"}>
              Sign in
            </Link>
          </>
        ) : null
      }
    >
      {step === "FORM" && (
        <form className="wha-form-body" onSubmit={handleRegister} noValidate>
          {error && (
            <div className="wha-alert wha-alert--error" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="wha-field">
            <label className="wha-label" htmlFor="signup-name">
              Full name
            </label>
            <div className="wha-input-wrap">
              <span className="lead">
                <User size={16} />
              </span>
              <input
                id="signup-name"
                type="text"
                required
                minLength={2}
                autoComplete="name"
                placeholder="e.g. Amit Verma"
                className="wha-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="wha-field">
            <label className="wha-label" htmlFor="signup-email">
              Email address
            </label>
            <div className="wha-input-wrap">
              <span className="lead">
                <Mail size={16} />
              </span>
              <input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="wha-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="wha-field">
            <label className="wha-label" htmlFor="signup-password">
              Password
            </label>
            <div className="wha-input-wrap">
              <span className="lead">
                <Lock size={16} />
              </span>
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="wha-input has-toggle"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="wha-peek"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="wha-submit"
            data-role={role}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating your account…" : "Send verification code"}
          </button>
        </form>
      )}

      {step === "OTP" && (
        <form className="wha-form-body" onSubmit={handleVerifyOtp} noValidate>
          {error && (
            <div className="wha-alert wha-alert--error" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="wha-otp-head">
            <span className="wha-otp-badge">
              <MailCheck size={20} />
            </span>
            {otpNotice && (
              <div className="wha-alert wha-alert--info" role="status">
                <span>{otpNotice}</span>
              </div>
            )}
          </div>

          <div style={{ padding: "4px 0" }}>
            <OtpPinInput
              length={6}
              value={otpValue}
              onChange={setOtpValue}
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="wha-submit"
            data-role={role}
            disabled={isSubmitting || otpValue.length < 6}
          >
            {isSubmitting ? "Verifying…" : "Verify and continue"}
          </button>

          <button
            type="button"
            className="wha-linkbtn"
            onClick={backToForm}
            style={{ margin: "0 auto" }}
          >
            Use a different email
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen bg-[#f4eee4] py-20 text-center text-sm text-[#606060]"
          style={{ fontFamily: "var(--gesso-font-body)" }}
        >
          Loading sign up…
        </div>
      }
    >
      <SignupFormContent />
    </Suspense>
  );
}
