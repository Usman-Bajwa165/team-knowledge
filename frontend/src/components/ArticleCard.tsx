// frontend/src/components/ArticleCard.tsx
import React, { useState } from "react";
import Link from "next/link";
import { formatDate, formatTime } from "../lib/format";
import { apiFetch } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function ArticleCard({
  article,
  onOpenComments,
}: {
  article: any;
  onOpenComments?: () => void;
}) {
  const { user } = useAuth();
  const [showInlineComment, setShowInlineComment] = useState(false);
  const [inlineContent, setInlineContent] = useState("");
  const [posting, setPosting] = useState(false);

  const snippet =
    article.content?.slice(0, 220) + (article.content?.length > 220 ? "…" : "");
  const authorName = article.author?.name || article.author?.email || "Unknown";

  async function postInlineComment(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!inlineContent.trim()) return;
    setPosting(true);
    try {
      const r = await apiFetch("/knowledge/comments", {
        method: "POST",
        body: { articleId: article.id, content: inlineContent.trim() },
      });
      if (r.ok) {
        setInlineContent("");
        setShowInlineComment(false);
        alert("Comment added successfully.");
        return; // stop, no redirect, no opening full comments
      } else {
        // try to surface backend message similar to CommentSection
        const b = await r.json().catch(() => ({}));
        alert(b?.message || "Failed to post comment");
      }
    } catch (err) {
      alert("Network error — try again.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="card-title mb-0">{article.title}</h5>
            <div className="small text-muted ms-3">
              By <strong>{authorName}</strong> · {formatDate(article.createdAt)}{" "}
              · {formatTime(article.createdAt)}
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-danger"
              title="Open comments"
              onClick={() => setShowInlineComment((s) => !s)}
            >
              <i className="fa fa-comments" />
            </button>
            <Link
              href={`/dashboard/articles/${article.id}`}
              className="btn btn-sm btn-outline-secondary"
            >
              Open
            </Link>
          </div>
        </div>

        <p className="card-text mt-3">{snippet}</p>

        {/* Inline comment box (appears below the article) */}
        {showInlineComment && (
          <div className="mt-3 border-top pt-3">
            {user ? (
              <form onSubmit={postInlineComment}>
                <textarea
                  className="form-control mb-2"
                  rows={3}
                  placeholder="Write a helpful comment…"
                  value={inlineContent}
                  onChange={(e) => setInlineContent(e.target.value)}
                />
                <div className="d-flex justify-content-between">
                  <div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => {
                        setShowInlineComment(false);
                        setInlineContent("");
                      }}
                      disabled={posting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-sm btn-primary"
                      disabled={posting || !inlineContent.trim()}
                    >
                      {posting ? "Posting…" : "Post"}
                    </button>
                  </div>

                  <div className="small text-muted align-self-center">
                    {user?.name ?? user?.email}
                  </div>
                </div>
              </form>
            ) : (
              <div className="small text-muted">
                <Link href="/login">Sign in</Link> to post comments.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
