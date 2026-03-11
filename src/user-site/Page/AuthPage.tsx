import { FormEvent, useId, useRef, useState } from "react";
import { useAuth } from "../../shared/context/AuthContext"
import React from "react";

interface AuthPageProps {
  onBack: () => void;
}

export function AuthPage({ onBack }: AuthPageProps) {
  const { loading, loginWithEmail, signupWithEmail, loginWithGoogle } =
    useAuth();

  const titleId = useId();
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const getAuthErrorMessage = (error: unknown) => {
    const err = error as { code?: string; message?: string } | undefined;
    const code = err?.code;

    switch (code) {
      case "auth/configuration-not-found":
        return "Firebase Authentication isn’t configured for this project yet. In Firebase Console → Authentication → Get started, then enable Email/Password and Google. After that, restart `npm run dev`.";
      case "auth/operation-not-allowed":
        return "This sign-in method is disabled. Enable it in Firebase Console → Authentication → Sign-in method.";
      case "auth/unauthorized-domain":
        return "This domain isn’t authorized for Firebase Auth. Add your site (and `localhost`) in Firebase Console → Authentication → Settings → Authorized domains.";
      case "auth/popup-blocked":
        return "Your browser blocked the Google sign-in popup. Allow popups, then try again.";
      case "auth/popup-closed-by-user":
        return "Google sign-in popup was closed before finishing. Please try again.";
      default:
        return (
          err?.message ??
          "Something went wrong with authentication. Please try again."
        );
    }
  };

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading || authSubmitting) return;
    setAuthSubmitting(true);
    setAuthError(null);
    try {
      if (isLoginMode) {
        await loginWithEmail(authEmail, authPassword);
      } else {
        await signupWithEmail(authEmail, authPassword);
      }
      onBack();
      setAuthEmail("");
      setAuthPassword("");
    } catch (error: unknown) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (loading || authSubmitting) return;
    setAuthSubmitting(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
      onBack();
    } catch (error: unknown) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setAuthSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className="w-full max-w-3xl mx-auto rounded-2xl bg-white text-neutral-900 shadow-2xl border border-black/10 overflow-hidden"
    >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 sm:px-7 py-4 bg-white/90 backdrop-blur border-b border-black/10">
            <div className="min-w-0">
              <p className="text-[11px] tracking-[0.28em] uppercase text-neutral-500">
                Ohannah Cabin
              </p>
              <h2 id={titleId} className="text-lg sm:text-xl font-semibold truncate">
                {isLoginMode ? "Sign in" : "Create account"}
              </h2>
            </div>
            <button
              type="button"
              className="shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-full border border-black/10 bg-white hover:bg-neutral-50 transition"
              onClick={onBack}
            >
              <span className="text-xs font-medium text-neutral-700">Back</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5">
            {/* Form */}
            <div className="md:col-span-3 px-5 sm:px-7 py-6 sm:py-7">
              <h3 className="text-2xl sm:text-3xl font-semibold leading-tight">
                {isLoginMode ? "Welcome back" : "Start your next stay"}
              </h3>
              <p className="mt-2 text-sm text-neutral-600">
                {isLoginMode
                  ? "Sign in to manage bookings and keep everything in one place."
                  : "Create an account to save dates, manage bookings, and receive updates."}
              </p>

              <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-800 mb-1.5">
                    Email
                  </label>
                  <input
                    ref={emailInputRef}
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/70 focus:border-black/40"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-800 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/70 focus:border-black/40"
                    placeholder={isLoginMode ? "Enter your password" : "Create a password"}
                    autoComplete={isLoginMode ? "current-password" : "new-password"}
                  />
                </div>

                {authError && (
                  <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {authError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={authSubmitting || loading}
                  className="w-full mt-1 px-4 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-900 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition-colors"
                >
                  {authSubmitting
                    ? isLoginMode
                      ? "Signing you in..."
                      : "Creating your account..."
                    : isLoginMode
                      ? "Sign in"
                      : "Create account"}
                </button>
              </form>

              <div className="mt-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-black/10" />
                <span className="text-[11px] text-neutral-500 uppercase tracking-[0.22em]">
                  or
                </span>
                <span className="h-px flex-1 bg-black/10" />
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={authSubmitting || loading}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-black/15 bg-white text-sm font-medium text-neutral-900 hover:bg-neutral-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <span>{isLoginMode ? "Continue with Google" : "Sign up with Google"}</span>
              </button>
            </div>

            {/* Side panel */}
            <div className="md:col-span-2 border-t md:border-t-0 md:border-l border-black/10 bg-neutral-950 text-white px-5 sm:px-7 py-6 sm:py-7 flex flex-col justify-between">
              <div>
                <p className="text-[11px] tracking-[0.28em] uppercase text-white/60 mb-3">
                  {isLoginMode ? "New here?" : "Already have an account?"}
                </p>
                <h4 className="text-xl font-semibold leading-snug">
                  {isLoginMode ? "Create your account" : "Sign in instead"}
                </h4>
                <p className="mt-2 text-sm text-white/75">
                  {isLoginMode
                    ? "Save your favourite dates and keep all your stays organised."
                    : "Pick up where you left off and manage your upcoming bookings."}
                </p>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  className="w-full md:w-auto px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-neutral-100 transition-colors"
                  onClick={() => {
                    setIsLoginMode((prev) => !prev);
                    setAuthError(null);
                  }}
                >
                  {isLoginMode ? "Create an account" : "Sign in"}
                </button>
              </div>
            </div>
          </div>
    </div>
  );
}

