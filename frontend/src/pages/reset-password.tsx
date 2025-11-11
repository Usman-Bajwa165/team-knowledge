// frontend/src/pages/reset-password.tsx
import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useRouter } from "next/router";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token: tokenQ } = router.query;
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [note, setNote] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);
  const [show, setShow] = useState(false);
  const [verifying, setVerifying] = useState(true);

  // derived state
  const passwordsMatch = password !== "" && password === confirm;
  const passwordValid = password.length >= 8;

  useEffect(() => {
    if (typeof tokenQ === "string") {
      setToken(tokenQ);
      verifyToken(tokenQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenQ]);

  async function verifyToken(t: string) {
    setVerifying(true);
    setExpired(false);
    try {
      const r = await apiFetch(`/auth/check-reset-token?token=${encodeURIComponent(t)}`, { method: "GET" });
      if (!r.ok) {
        setExpired(true);
      } else {
        setExpired(false);
      }
    } catch {
      setExpired(true);
    } finally {
      setVerifying(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setNote(null);

    if (!token) {
      setNote({ type: "error", text: "Missing token — use the link from your email." });
      return;
    }
    if (!passwordValid) {
      setNote({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    if (!passwordsMatch) {
      setNote({ type: "error", text: "Passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      const r = await apiFetch("/auth/reset-password", { method: "POST", body: { token, password } });
      const b = await r.json().catch(() => ({}));
      if (!r.ok) {
        // backend returns 400/404 for invalid/expired tokens -> show expired UI
        if (r.status === 400 || r.status === 404) {
          setExpired(true);
        } else {
          setNote({ type: "error", text: b?.message || "Reset failed." });
        }
      } else {
        setNote({ type: "success", text: "Password updated — redirecting to sign in…" });
        setTimeout(() => router.push("/login"), 1400);
      }
    } catch {
      setNote({ type: "error", text: "Network error — try again." });
    } finally {
      setLoading(false);
    }
  }

  if (verifying) {
    return (
      <main className="container py-5 text-center">
        <div className="card shadow-sm p-5 mx-auto" style={{ maxWidth: 480 }}>
          <div className="spinner-border text-danger" role="status" />
          <div className="mt-3 text-muted">Verifying reset link…</div>
        </div>
      </main>
    );
  }

  if (expired) {
    return (
      <main className="container py-5 text-center">
        <div className="card shadow-sm p-5 mx-auto" style={{ maxWidth: 480 }}>
          <h3 className="text-danger mb-3">Reset link expired</h3>
          <p>The reset link is invalid, already used, or expired (valid only for 1 hour).</p>
          <Link href="/forgot-password" className="btn btn-danger mt-3">
            Request new link
          </Link>
        </div>
      </main>
    );
  }

  const canSubmit = !!token && passwordValid && passwordsMatch && !loading && !verifying;

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h3 style={{ color: "#8B2D2D" }}>Reset password</h3>
            <p className="text-muted">Enter a new password for your account.</p>

            <form onSubmit={submit} noValidate>
              <div className="mb-3 position-relative">
                <label className="form-label small">New Password</label>
                <input
                  className="form-control"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby="pwHelp"
                  autoComplete="new-password"
                />
                <i
                  className={`fa ${show ? "fa-eye-slash" : "fa-eye"} position-absolute end-0 top-50 translate-middle-y me-3`}
                  style={{ cursor: "pointer", marginTop: 15 }}
                  onClick={() => setShow(!show)}
                />
                <div id="pwHelp" className="form-text mt-1">
                  {!passwordValid ? (
                    <span className="text-warning">Password must be at least 8 characters.</span>
                  ) : (
                    <span className="text-success">Password length OK.</span>
                  )}
                </div>
              </div>

              <div className="mb-3 position-relative">
                <label className="form-label small">Confirm Password</label>
                <input
                  className="form-control"
                  type={show ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  aria-describedby="confirmHelp"
                  autoComplete="new-password"
                />
                <i
                  className={`fa ${show ? "fa-eye-slash" : "fa-eye"} position-absolute end-0 top-50 translate-middle-y me-3`}
                  style={{ cursor: "pointer", marginTop: 15 }}
                  onClick={() => setShow(!show)}
                />
                <div id="confirmHelp" className="form-text mt-1">
                  {confirm.length === 0 ? (
                    <span className="text-muted">Re-enter your new password.</span>
                  ) : passwordsMatch ? (
                    <span className="text-success"><i className="fa fa-check me-1" />Passwords match</span>
                  ) : (
                    <span className="text-danger"><i className="fa fa-times me-1" />Passwords do not match</span>
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <button className="btn btn-danger" disabled={!canSubmit}>
                  {loading ? "Saving…" : "Save new password"}
                </button>
                <Link href="/login" className="small">
                  Back to sign in
                </Link>
              </div>
            </form>

            {note && <div className={`alert mt-3 ${note.type === "error" ? "alert-danger" : "alert-success"}`}>{note.text}</div>}
          </div>
        </div>
      </div>
    </main>
  );
}
