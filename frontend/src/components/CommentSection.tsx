// frontend/src/components/CommentSection.tsx
import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function CommentSection({
  articleId,
  articleAuthorId,
  onClose,
}: {
  articleId: number;
  articleAuthorId?: number | null;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<Record<number, boolean>>({});

  async function load() {
    const r = await apiFetch(`/knowledge/articles/${articleId}/comments`);
    if (!r.ok) {
      console.error("Failed to load comments");
      setComments([]);
      return;
    }
    const data = await r.json();
    setComments(data || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const r = await apiFetch("/knowledge/comments", {
        method: "POST",
        body: { articleId, content: content.trim() },
      });
      if (r.ok) {
        setContent("");
        await load();
      } else {
        const b = await r.json().catch(() => ({}));
        alert(b?.message || "Failed to post comment");
      }
    } catch (err) {
      alert("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }

  function canDeleteComment(comment: any) {
    if (!user) return false;
    // comment.author?.id might be undefined; safe-check
    const commentAuthorId = comment?.author?.id;
    // comment author
    if (user.id === commentAuthorId) return true;
    // article author
    if (articleAuthorId && user.id === articleAuthorId) return true;
    // admin
    if (user.role === "admin") return true;
    return false;
  }

  async function deleteComment(commentId: number) {
    if (!confirm("Delete this comment?")) return;
    setDeleting((s) => ({ ...s, [commentId]: true }));
    try {
      const r = await apiFetch(`/knowledge/comments/${commentId}`, { method: "DELETE" });
      if (!r.ok) {
        const b = await r.json().catch(() => ({}));
        alert(b?.message || "Delete failed");
      } else {
        await load();
      }
    } catch (err) {
      alert("Network error — try again.");
    } finally {
      setDeleting((s) => {
        const next = { ...s };
        delete next[commentId];
        return next;
      });
    }
  }

  return (
    <div className="card p-3 mt-2">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">Discussion</h6>
        <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>
          <i className="fa fa-arrow-right" /> Close
        </button>
      </div>

      {comments.length === 0 && <div className="text-muted small">No comments yet.</div>}

      {comments.map((c) => (
        <div key={c.id} className="border-top pt-2 mt-2">
          <div className="d-flex justify-content-between align-items-start">
            <div className="small">
              <strong>{c.author?.name ?? c.author?.email ?? "Unknown"}</strong>{" "}
              <span className="text-muted">· {new Date(c.createdAt).toLocaleString()}</span>
              <div className="mt-1">{c.content}</div>
            </div>

            <div>
              {canDeleteComment(c) && (
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => deleteComment(c.id)}
                  disabled={!!deleting[c.id]}
                >
                  {deleting[c.id] ? "Deleting…" : "Delete"}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {user ? (
        <form className="mt-3" onSubmit={addComment}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="form-control mb-2"
            rows={3}
            placeholder="Write a helpful comment…"
          />
          <div className="d-flex justify-content-end">
            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Posting…" : "Post comment"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-3 small text-muted">Sign in to post comments.</div>
      )}
    </div>
  );
}
