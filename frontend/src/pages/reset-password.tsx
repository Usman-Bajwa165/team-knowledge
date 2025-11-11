// frontend/src/pages/reset-password.tsx
import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
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

  useEffect(() => {
    if (typeof tokenQ === "string") setToken(tokenQ);
  }, [tokenQ]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setNote(null);
    if (!token) {
      setNote({ type: "error", text: "Missing token — use the link from your email." });
      return;
    }
    if (password.length < 8) {
      setNote({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    if (password !== confirm) {
      setNote({ type: "error", text: "Passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      const r = await apiFetch("/auth/reset-password", { method: "POST", body: { token, password } });
      const b = await r.json().catch(() => ({}));
      if (!r.ok) {
        setNote({ type: "error", text: b?.message || "Reset failed." });
      } else {
        setNote({ type: "success", text: "Password updated — redirecting to sign in…" });
        setTimeout(() => router.push("/login"), 1400);
      }
    } catch (err) {
      setNote({ type: "error", text: "Network error — try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <NavBar />
      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm p-4">
              <h3 style={{ color: "#8B2D2D" }}>Reset password</h3>
              <p className="text-muted">Enter a new password for your account.</p>

              <form onSubmit={submit}>
                <div className="mb-3">
                  <label className="form-label small">New password</label>
                  <input className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
                </div>
                <div className="mb-3">
                  <label className="form-label small">Confirm password</label>
                  <input className="form-control" value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" />
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <button className="btn btn-danger" disabled={loading}>{loading ? "Saving…" : "Save new password"}</button>
                  <Link href="/login" className="small">Back to sign in</Link>
                </div>
              </form>

              {note && <div className={`alert mt-3 ${note.type === "error" ? "alert-danger" : "alert-success"}`}>{note.text}</div>}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
