// frontend/src/components/CommentSection.tsx
import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatDate, formatTime } from "../lib/format";

export default function CommentSection({
  articleId,
  onClose,
}: {
  articleId: number;
  onClose: () => void;
}) {
  const { user, refreshUser } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const r = await apiFetch(`/knowledge/articles/${articleId}/comments`);
    if (!r.ok) return;
    setComments(await r.json());
  }
  useEffect(() => { load(); }, [articleId]);

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    const r = await apiFetch("/knowledge/comments", {
      method: "POST",
      body: { articleId, content },
    });
    if (r.ok) {
      setContent("");
      await load();
      await refreshUser(); // small refresh so UI can re-check roles if needed
    } else {
      // handle 401: open login
      if (r.status === 401) {
        alert('Please sign in to post comments.');
      } else {
        const b = await r.json().catch(()=>({message:'Error'}));
        alert(b?.message || 'Failed to post comment');
      }
    }
    setLoading(false);
  }

  return (
    <div className="card p-3 mt-2">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">Discussion</h6>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>
            <i className="fa fa-arrow-right" /> Close
          </button>
        </div>
      </div>

      {comments.length === 0 && <div className="text-muted mb-2">No comments yet.</div>}

      {comments.map((c) => (
        <div key={c.id} className="border-top pt-2 mt-2">
          <div className="d-flex justify-content-between">
            <div className="small">
              <strong>{c.author?.name ?? c.author?.email}</strong>{" "}
              <span className="text-muted">· {formatDate(c.createdAt)} {formatTime(c.createdAt)}</span>
            </div>
          </div>
          <div className="mt-1">{c.content}</div>
        </div>
      ))}

      {user ? (
        <form className="mt-3" onSubmit={addComment}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="form-control mb-2"
            rows={3}
            placeholder="Write a helpful comment..."
          />
          <div className="d-flex justify-content-end">
            <button className="btn btn-danger" disabled={loading}>
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
