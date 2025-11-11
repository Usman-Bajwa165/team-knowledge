// frontend/src/pages/login.tsx
import React, { useState } from "react";
import { useAuth } from "../lib/auth";
import Router from "next/router";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNote(null);
    setLoading(true);
    const r = await login(email, password);
    setLoading(false);
    if (!r.ok) setNote(r.message || "Login failed");
    else Router.push("/dashboard");
    if (!r.ok) setNote("Invalid credentials");
    else Router.push("/dashboard");
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h2 className="mb-3" style={{ color: "#8B2D2D" }}>
              Welcome back
            </h2>
            <p className="text-muted">
              Sign in to your account and continue contributing.
            </p>

            <form onSubmit={onSubmit} className="mt-3">
              <div className="mb-3">
                <label className="form-label small">Email</label>
                <input
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                />
              </div>
              <div className="mb-3 position-relative">
                <label className="form-label small">Password</label>
                <input
                  className="form-control"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <i
                  className={`fa ${show ? "fa-eye-slash" : "fa-eye"} position-absolute end-0 top-50 translate-middle-y me-3`}
                  style={{ cursor: "pointer",marginTop:15 }}
                  onClick={() => setShow(!show)}
                />
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <button className="btn btn-danger" disabled={loading}>
                  {loading ? "Signing in…" : "Sign in"}
                </button>
                <a href="/forgot-password" className="small">
                  Forgot password?
                </a>
              </div>

              {note && <div className="alert alert-danger">{note}</div>}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
