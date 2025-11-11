// frontend/src/pages/forgot-password.tsx
import React, { useEffect, useRef, useState } from "react";
import { apiFetch } from "../lib/api";
import Link from "next/link";

/**
 * Forgot password page with live email existence check.
 * Requires backend endpoint: GET /auth/check-email?email=...
 *  - 200 OK => email exists
 *  - 404 Not Found => email not found
 */

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const [valid, setValid] = useState(false); // true when backend confirms email exists
  const [checking, setChecking] = useState(false); // indicates check in progress
  const checkTimer = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastChecked = useRef<string>("");

  // clean up on unmount
  useEffect(() => {
    return () => {
      if (checkTimer.current) window.clearTimeout(checkTimer.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  function onEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.trim();
    setEmail(val);
    setNote(null);
    setValid(false);

    // clear previous debounce timer
    if (checkTimer.current) {
      window.clearTimeout(checkTimer.current);
      checkTimer.current = null;
    }
    // cancel previous in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    // quick client-side email format check
    if (!/\S+@\S+\.\S+/.test(val)) {
      setChecking(false);
      setValid(false);
      return;
    }

    // debounce before calling backend
    setChecking(true);
    checkTimer.current = window.setTimeout(() => {
      checkTimer.current = null;
      lastChecked.current = val;
      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;

      // call backend to check email existence
      apiFetch(`/auth/check-email?email=${encodeURIComponent(val)}`, { method: "GET", headers: {}, body: undefined })
        .then((r) => {
          // ignore if input changed since request created
          if (lastChecked.current !== val) return;
          setChecking(false);
          if (r.ok) setValid(true);
          else setValid(false);
        })
        .catch((err) => {
          if (err?.name === "AbortError") return;
          setChecking(false);
          setValid(false);
        })
        .finally(() => {
          abortRef.current = null;
        });
    }, 450);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setNote(null);
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setNote({ type: "error", text: "Please enter a valid email." });
      return;
    }
    if (!valid) {
      setNote({ type: "error", text: "Email not found. Please register or double-check the address." });
      return;
    }

    setLoading(true);
    try {
      const r = await apiFetch("/auth/forgot-password", { method: "POST", body: { email } });
      const b = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (r.status === 404) {
          setNote({ type: "error", text: "Email not found. Would you like to register?" });
        } else {
          setNote({ type: "error", text: b?.message || "Failed to send reset email." });
        }
      } else {
        setNote({ type: "success", text: "Reset email sent successfully. Check your inbox." });
      }
    } catch {
      setNote({ type: "error", text: "Network error — try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h3 style={{ color: "#8B2D2D" }}>Forgot password</h3>
            <p className="text-muted">Enter your account email and we’ll send a password reset link (valid 1 hour).</p>

            <form onSubmit={submit}>
              <div className="mb-3">
                <label className="form-label small">Email</label>
                <input
                  className="form-control"
                  value={email}
                  onChange={onEmailChange}
                  type="email"
                  placeholder="you@company.com"
                />
                <div className="form-text mt-1">
                  {checking && <span className="text-muted">Checking email…</span>}
                  {!checking && email && !valid && /\S+@\S+\.\S+/.test(email) && (
                    <span className="text-warning">Email not found. <Link href="/register">Register instead?</Link></span>
                  )}
                  {!checking && valid && <span className="text-success">Email found — you can request a reset link.</span>}
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <button className="btn btn-danger" disabled={!valid || loading}>
                  {loading ? "Sending…" : "Send reset link"}
                </button>
                <Link href="/login" className="small">Back to sign in</Link>
              </div>
            </form>

            {note && <div className={`alert mt-3 ${note.type === "error" ? "alert-danger" : "alert-success"}`}>{note.text}</div>}
          </div>
        </div>
      </div>
    </main>
  );
}
