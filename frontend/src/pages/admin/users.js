import React, { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import { apiFetch } from "../../lib/api";
import Router from "next/router";

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);

  // add-user form state
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);

  useEffect(() => {
    if (user && user.role !== "admin") Router.push("/");
    if (!user) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const r = await apiFetch("/admin/users");
      if (!r.ok) {
        let body = null;
        try {
          body = await r.json();
        } catch {
          body = await r.text().catch(() => null);
        }
        const msg =
          (body && (body.message || body.error)) ||
          `Failed to load users (status ${r.status})`;
        setError(msg);
        return;
      }
      const j = await r.json().catch(() => null);
      const data = Array.isArray(j)
        ? j
        : j && (j.users || j.data)
        ? j.users || j.data
        : [];
      setUsers(data);
    } catch (err) {
      setError(
        err && err.message ? err.message : "Network error while loading users"
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleAdmin(u) {
    setError(null);
    setProcessingId(u.id);
    try {
      if (u.id === user?.id) {
        setError("You cannot change your own role.");
        return;
      }

      const newRole = u.role === "admin" ? "user" : "admin";
      const r = await apiFetch(`/admin/users/${u.id}/role`, {
        method: "PATCH",
        body: { role: newRole },
      });

      if (!r.ok) {
        let body = null;
        try {
          body = await r.json();
        } catch {
          body = await r.text().catch(() => null);
        }
        const msg =
          (body && (body.message || body.error)) ||
          `Failed to update role (status ${r.status})`;
        setError(msg);
        return;
      }

      await load();
    } catch (err) {
      setError(
        err && err.message ? err.message : "Network error while updating role"
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function removeUser(u) {
    setError(null);
    const confirmed = confirm(
      "Delete this user? All articles and comments belonging to this user will be deleted too. This action is irreversible."
    );
    if (!confirmed) return;

    if (u.id === user?.id) {
      setError(
        "You cannot delete the account you are currently signed in with."
      );
      return;
    }

    setProcessingId(u.id);
    try {
      const r = await apiFetch(`/admin/users/${u.id}`, { method: "DELETE" });
      if (!r.ok) {
        let body = null;
        try {
          body = await r.json();
        } catch {
          body = await r.text().catch(() => null);
        }
        const msg =
          (body && (body.message || body.error)) ||
          `Delete failed (status ${r.status})`;
        setError(msg);
        return;
      }
      await load();
    } catch (err) {
      setError(
        err && err.message ? err.message : "Network error while deleting user"
      );
    } finally {
      setProcessingId(null);
    }
  }

  // Add-user form submit
  async function handleAddSubmit(e) {
    e.preventDefault();
    setAddError(null);

    // basic client-side checks
    if (!addEmail || !addPassword) {
      setAddError("Email and password are required.");
      return;
    }

    if (addPassword.length < 7) {
      setAddError("Password must be at least 7 characters long.");
      return;
    }

    setAddLoading(true);
    try {
      const payload = {
        name: addName || undefined,
        email: addEmail,
        password: addPassword,
      };
      const r = await apiFetch("/admin/users", {
        method: "POST",
        body: payload,
      });
      if (!r.ok) {
        // try to parse server message
        let body = null;
        try {
          body = await r.json();
        } catch {
          body = await r.text().catch(() => null);
        }
        const msg =
          (body && (body.message || body.error)) ||
          `Create failed (status ${r.status})`;

        // friendly specific message when email exists
        if (r.status === 409 || /email/i.test(msg)) {
          setAddError("Email already registered — try another.");
        } else {
          setAddError(msg);
        }
        return;
      }

      // success -> clear form, hide and reload
      setAddName("");
      setAddEmail("");
      setAddPassword("");
      setShowAdd(false);
      await load();
    } catch (err) {
      setAddError(
        err && err.message ? err.message : "Network error while creating user"
      );
    } finally {
      setAddLoading(false);
    }
  }

  // robust article count extraction (handles several API shapes)
  function getArticleCount(u) {
    try {
      if (u && u._count && typeof u._count === 'object') {
        const keys = [
          'KnowledgeArticle',
          'KnowledgeArticles',
          'knowledgeArticle',
          'knowledgeArticles',
          'articles',
          'Articles',
          'article',
          'Article',
        ];
        for (const k of keys) {
          if (typeof u._count[k] === 'number') return u._count[k];
        }
      }
      if (Array.isArray(u?.articles)) return u.articles.length;
      if (typeof u?.articlesCount === 'number') return u.articlesCount;
      if (typeof u?.articles_count === 'number') return u.articles_count;
      if (typeof u?.articleCount === 'number') return u.articleCount;
      if (typeof u?.count === 'number') return u.count;
      // fallback: maybe API returns a nested object like counts.articles
      if (u?.counts && typeof u.counts.articles === 'number') return u.counts.articles;
      return 0;
    } catch (e) {
      return 0;
    }
  }

  // hide the current logged-in user from the list
  const visibleUsers = users.filter((u) => u.id !== (user && user.id));

  return (
    <div className="container container-centered py-5">
      <div className="d-flex justify-content-between align-items-center header-row">
        <h3 className="admin-title"> Users</h3>
        <div>
          <button
            className="btn btn-sm btn-success"
            onClick={() => setShowAdd(true)}
          >
            Add user
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger my-3">{error}</div>}

      {/* Add-user inline panel */}
      {showAdd && (
        <div className="card my-3 p-3">
          <form onSubmit={handleAddSubmit}>
            <div className="row g-2 align-items-center">
              <div className="col-md-3">
                <input
                  className="form-control"
                  placeholder="Name (optional)"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <input
                  className="form-control"
                  placeholder="Email"
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-3">
                <input
                  className="form-control"
                  placeholder="Password"
                  type="password"
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  required
                />
              </div>

              {/* buttons moved to the same row as fields */}
              <div className="col-md-3 d-flex">
                <button
                  className="btn btn-primary me-2"
                  type="submit"
                  disabled={addLoading}
                >
                  {addLoading ? "Creating…" : "Create"}
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => {
                    setShowAdd(false);
                    setAddError(null);
                  }}
                  disabled={addLoading}
                >
                  Cancel
                </button>
              </div>
            </div>

            {addError && <div className="mt-2 text-danger">{addError}</div>}
          </form>
        </div>
      )}

      {loading ? (
        <div className="my-3">Loading users…</div>
      ) : (
        <div className="table-scroll">
          <table className="table mt-3">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Articles</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{getArticleCount(u)}</td>
                  <td>{u.role}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => toggleAdmin(u)}
                      disabled={processingId !== null}
                    >
                      {processingId === u.id
                        ? "Working…"
                        : u.role === "admin"
                        ? "Demote"
                        : "Promote"}
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => removeUser(u)}
                      disabled={processingId !== null}
                    >
                      {processingId === u.id ? "Working…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
              {visibleUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-muted">
                    No other users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .header-row {
          position: relative;
          padding-top: 4px;
          padding-bottom: 4px;
        }
        .admin-title {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          margin: 0;
        }

        /* scroll the table body while keeping header visible */
        .table-scroll {
          max-height: 60vh;
          overflow-y: auto;
        }
        .table-scroll thead th {
          position: sticky;
          top: 0;
          background: white;
          z-index: 2;
        }

        /* small tweak: keep table responsive */
        .table {
          margin-bottom: 0;
        }

        @media (max-width: 576px) {
          .admin-title {
            position: static;
            transform: none;
            text-align: center;
            margin-bottom: 0.5rem;
          }
          .header-row {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
