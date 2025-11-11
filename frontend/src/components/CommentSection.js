import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function CommentSection({ articleId, onClose }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    const r = await apiFetch(`/knowledge/articles/${articleId}/comments`);
    if (!r.ok) return;
    const j = await r.json();
    setComments(j);
  }

  useEffect(() => { load(); }, [articleId]);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    const r = await apiFetch('/knowledge/comments', { method: 'POST', body: { articleId, content: text }});
    if (r.ok) {
      setText('');
      await load();
    }
    setLoading(false);
  }

  return (
    <div className="card p-3 mt-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">Discussion</h6>
        <button className="btn btn-sm btn-link" onClick={onClose}><i className="fa fa-arrow-right" /> Close</button>
      </div>

      {comments.map(c => (
        <div key={c.id} className="border-top pt-2 mt-2">
          <div className="small text-muted">
            <strong>{c.author?.name ?? c.author?.email}</strong> · {new Date(c.createdAt).toLocaleString()}
          </div>
          <div className="mt-1">{c.content}</div>
        </div>
      ))}

      {user ? (
        <form onSubmit={submit} className="mt-3">
          <textarea className="form-control mb-2" rows="3" value={text} onChange={e=>setText(e.target.value)} />
          <div className="d-flex justify-content-end">
            <button className="btn btn-primary" disabled={loading}>{loading ? 'Posting…' : 'Post comment'}</button>
          </div>
        </form>
      ) : (
        <div className="mt-3 small text-muted">Sign in to post comments.</div>
      )}
    </div>
  );
}
