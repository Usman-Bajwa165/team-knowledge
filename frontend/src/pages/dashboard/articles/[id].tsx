// frontend/src/pages/dashboard/articles/[id].tsx
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import NavBar from "../../../components/NavBar";
import { apiFetch } from "../../../lib/api";
import { useAuth } from "../../../lib/auth";
import CommentSection from "../../../components/CommentSection";
import { formatDate, formatTime } from "../../../lib/format";
import Link from "next/link";

export default function ArticlePage() {
  const router = useRouter();
  const { id, edit: editQ } = router.query;
  const { user, refreshUser } = useAuth();
  const [article, setArticle] = useState<any>(null);
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);

  // editing state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!id) return;
    const r = await apiFetch(`/knowledge/articles/${id}`);
    if (!r.ok) {
      const b = await r.json().catch(() => ({}));
      alert(b?.message || "Article not found");
      router.push("/dashboard");
      return;
    }
    const a = await r.json();
    setArticle(a);
    setTitle(a.title || "");
    setContent(a.content || "");
  }

  useEffect(() => {
    load();
    // if ?edit=1 present, toggle editing after load
    if (editQ === "1") setEditing(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, editQ]);

  // compute ownership or admin
  const isOwner = user && (user.id === article?.author?.id || user.role === "admin");

  async function toggleEdit(on?: boolean) {
    if (on === undefined) on = !editing;
    if (on && !isOwner) {
      alert("Only the author or admin can edit this article.");
      return;
    }
    setEditing(on);
    // update url query param (so back/refresh behaves)
    const url = `/dashboard/articles/${id}`;
    if (on) {
      router.replace(`${url}?edit=1`, undefined, { shallow: true });
    } else {
      router.replace(url, undefined, { shallow: true });
    }
  }

  async function saveChanges(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Title and content cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const r = await apiFetch(`/knowledge/articles/${article.id}`, {
        method: "PATCH",
        body: { title: title.trim(), content: content.trim() },
      });
      if (!r.ok) {
        const b = await r.json().catch(() => ({}));
        alert(b?.message || "Failed to save changes.");
      } else {
        const updated = await r.json();
        setArticle(updated);
        setEditing(false);
        // remove edit query
        router.replace(`/dashboard/articles/${article.id}`, undefined, { shallow: true });
      }
    } catch (err) {
      alert("Network error — try again.");
    } finally {
      setSaving(false);
    }
  }

  async function removeArticle() {
    if (!confirm("Delete this article?")) return;
    const r = await apiFetch(`/knowledge/articles/${article.id}`, { method: "DELETE" });
    if (r.ok) router.push("/dashboard");
    else alert("Delete failed");
  }

  if (!article) {
    return (
      <>
        <NavBar />
        <main className="container py-5"><div className="text-muted">Loading…</div></main>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="container py-5">
        <div className="mb-3">
          <Link href="/dashboard" className="btn btn-outline-secondary btn-sm"><i className="fa fa-arrow-left" /> Back to dashboard</Link>
        </div>

        <div className="card shadow-sm p-4 mb-3">
          <div className="d-flex justify-content-between align-items-start">
            <div style={{ flex: 1 }}>
              {editing ? (
                <form onSubmit={saveChanges}>
                  <input className="form-control form-control-lg mb-3" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <textarea rows={10} className="form-control mb-3" value={content} onChange={(e) => setContent(e.target.value)} />
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => toggleEdit(false)} disabled={saving}>Cancel</button>
                    <button className="btn btn-danger" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="mb-1">{article.title}</h1>
                  <div className="small text-muted">By <strong>{article.author?.name ?? article.author?.email}</strong> · {formatDate(article.createdAt)} {formatTime(article.createdAt)}</div>
                </>
              )}
            </div>

            {!editing && (
              <div className="d-flex gap-2 ms-3">
                <button className="btn btn-outline-danger" onClick={() => setShowComments(s => !s)}><i className="fa fa-comments" /> {showComments ? "Hide" : "Comments"}</button>
                {isOwner && (
                  <>
                    <button className="btn btn-outline-secondary" onClick={() => toggleEdit(true)}>Edit</button>
                    <button className="btn btn-danger" onClick={removeArticle}>Delete</button>
                  </>
                )}
              </div>
            )}
          </div>

          {!editing && (
            <>
              <hr />
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </>
          )}
        </div>

        {showComments && <CommentSection articleId={article.id} onClose={() => setShowComments(false)} />}
      </main>
    </>
  );
}
