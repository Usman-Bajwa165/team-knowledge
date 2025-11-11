import React, { useState } from "react";
import { useAuth } from "../lib/auth";
import Router from "next/router";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const passwordValid = password.length >= 7;
  const emailValid = /\S+@\S+\.\S+/.test(email);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNote(null);

    if (!name.trim() || !emailValid || !passwordValid) {
      if (!name.trim()) return setNote("Please enter your full name.");
      if (!emailValid) return setNote("Please enter a valid email address.");
      if (!passwordValid) return setNote("Password must be at least 7 characters.");
      return;
    }

    setLoading(true);
    const r = await register({ name, email, password });
    setLoading(false);
    if (!r.ok) setNote(r.message || "Registration failed");
    else {
      setNote(null);
      Router.push("/login");
    }
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card shadow-sm p-4">
            <h2 style={{ color: "#8B2D2D" }}>Create your account</h2>
            <p className="text-muted">Start writing articles for your team.</p>

            <form onSubmit={onSubmit} className="mt-3">
              <div className="mb-3">
                <label className="form-label small">Full name</label>
                <input
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small">Email</label>
                <input
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                />
                <div className="form-text">
                  {!email ? null : emailValid ? <span className="text-success">Looks good</span> : <span className="text-warning">Invalid email</span>}
                </div>
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
                  style={{ cursor: "pointer", marginTop: 3 }}
                  onClick={() => setShow(!show)}
                />
                <div className="form-text mt-1">
                  {password ? (
                    passwordValid ? (
                      <span className="text-success">Good password length</span>
                    ) : (
                      <span className="text-warning">Password must be at least 7 characters</span>
                    )
                  ) : (
                    <span className="text-muted">Use at least 7 characters — mix letters and numbers for strength</span>
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <button className="btn btn-danger" disabled={loading}>
                  {loading ? "Creating…" : "Create account"}
                </button>
                <a href="/login" className="small">
                  Already registered? Sign in
                </a>
              </div>

              {note && <div className="alert alert-danger mt-3">{note}</div>}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
