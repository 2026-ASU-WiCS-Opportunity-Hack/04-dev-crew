"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRecord } from "@/lib/types";
import { getDashboardPathForRole } from "@/lib/auth/session";

const reasonCopy: Record<string, string> = {
  auth_required: "Sign in to continue.",
  session_required: "Sign in again to continue.",
  session_expired: "Your session expired due to inactivity. Please sign in again.",
};

function getLoginErrorMessage(message: string) {
  if (message.toLowerCase().includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }

  return message;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [sessionReason, setSessionReason] = useState<string | null>(null);
  const [nextPath, setNextPath] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSessionReason(params.get("reason"));
    setNextPath(params.get("next"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
      });
      if (signUpError) {
        setError(getLoginErrorMessage(signUpError.message));
      } else {
        setMessage("Check your email for a confirmation link.");
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(getLoginErrorMessage(signInError.message));
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        let destination = "/dashboard/coach";

        if (user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

          const profile = profileData as Pick<ProfileRecord, "role"> | null;
          if (profile?.role) {
            destination = getDashboardPathForRole(profile.role);
          }
        }

        const sessionResponse = await fetch("/api/auth/session", {
          method: "POST",
        });
        const sessionResult = await sessionResponse.json();

        if (!sessionResponse.ok || !sessionResult.ok) {
          await supabase.auth.signOut();
          setError(sessionResult.error ?? "Unable to start your session.");
          setLoading(false);
          return;
        }

        const target =
          nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
            ? nextPath
            : destination;

        router.push(target);
        router.refresh();
        return;
      }
    }

    setLoading(false);
  }

  return (
    <div
      className="section"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div className="page-header" style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span className="eyebrow">WIAL Platform</span>
          <h1 className="section-title">{isSignUp ? "Create Account" : "Sign In"}</h1>
          <p className="section-copy">
            {isSignUp
              ? "Create your account to access the dashboard."
              : "Sign in to access your dashboard."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="contact-form" style={{ padding: "2rem" }}>
          {sessionReason && !error && !isSignUp && (
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              {reasonCopy[sessionReason] ?? "Sign in to continue."}
            </p>
          )}
          <div className="contact-form__field-group">
            <label className="contact-form__label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="contact-form__field"
              placeholder="you@example.com"
            />
          </div>

          <div className="contact-form__field-group">
            <label className="contact-form__label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="contact-form__field"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>{error}</p>
          )}
          {message && (
            <p style={{ color: "#16a34a", fontSize: "0.9rem" }}>{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="button-primary"
            style={{ width: "100%", opacity: loading ? 0.5 : 1 }}
          >
            {loading
              ? "Please wait..."
              : isSignUp
              ? "Create Account"
              : "Sign In"}
          </button>

          <p
            style={{
              textAlign: "center",
              fontSize: "0.9rem",
              color: "var(--muted)",
              marginTop: "1rem",
            }}
          >
            {isSignUp ? "Already have an account?" : "Don\u2019t have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="home-link"
              style={{ fontSize: "0.9rem" }}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
