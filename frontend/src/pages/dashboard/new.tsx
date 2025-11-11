// frontend/src/pages/dashboard/new.tsx
import React, { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { apiFetch } from '../../lib/api';
import Router from 'next/router';

export default function NewArticle() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    // simple client redirect
    if (typeof window !== 'undefined') Router.push('/login');
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const r = await apiFetch('/knowledge/articles', { method: 'POST', body: { title, content } });
    if (r.ok) {
      const a = await r.json();
      Router.push(`/dashboard/articles/${a.id}`);
    } else {
      const b = await r.json().catch(()=>({message:'Failed'}));
      alert(b?.message || 'Failed');
    }
    setLoading(false);
  }

  return (
    <>
      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-9">
            <div className="card shadow-sm p-4">
              <h3 style={{ color: '#8B2D2D' }}>New Article</h3>
              <form onSubmit={submit}>
                <div className="mb-3">
                  <input className="form-control form-control-lg" placeholder="Article title" value={title} onChange={e=>setTitle(e.target.value)} />
                </div>
                <div className="mb-3">
                  <textarea rows={10} className="form-control" placeholder="Write your article..." value={content} onChange={e=>setContent(e.target.value)} />
                </div>
                <div className="d-flex justify-content-end">
                  <button className="btn btn-danger" disabled={loading}>{loading ? 'Publishing…' : 'Publish'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
