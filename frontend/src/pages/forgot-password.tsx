// frontend/src/pages/forgot-password.tsx
import React, { useState } from "react";
import NavBar from "../components/NavBar";
import { apiFetch } from "../lib/api";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setNote(null);
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setNote({ type: "error", text: "Please enter a valid email." });
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
        setNote({ type: "success", text: "Reset Email sent successfully.Check your inbox" });
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
              <h3 style={{ color: "#8B2D2D" }}>Forgot password</h3>
              <p className="text-muted">Enter your account email and we’ll send a password reset link (valid 1 hour).</p>

              <form onSubmit={submit}>
                <div className="mb-3">
                  <label className="form-label small">Email</label>
                  <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <button className="btn btn-danger" disabled={loading}>{loading ? "Sending…" : "Send reset link"}</button>
                  <Link href="/login" className="small">Back to sign in</Link>
                </div>
              </form>

              {note && (
                <div className={`alert mt-3 ${note.type === "error" ? "alert-danger" : "alert-success"}`}>
                  {note.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
