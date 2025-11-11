// frontend/src/pages/dashboard/index.tsx
import React, { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import ArticleCard from '../../components/ArticleCard';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [date, setDate] = useState<string>('');

  async function load() {
    let path = '/knowledge/articles';
    // support server-side filters via query string if backend supported; otherwise filter client-side.
    const r = await apiFetch(path);
    if (!r.ok) return;
    const data = await r.json();
    setArticles(data);
  }

  useEffect(() => { load(); }, []);

  const filtered = articles.filter(a => {
    const matchesQ = !q || (a.title?.toLowerCase().includes(q.toLowerCase()) || a.author?.name?.toLowerCase().includes(q.toLowerCase()) || a.author?.email?.toLowerCase().includes(q.toLowerCase()));
    const matchesDate = !date || new Date(a.createdAt).toISOString().slice(0,10) === date;
    return matchesQ && matchesDate;
  });

  return (
    <>
      <NavBar />
      <main className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 style={{ color: '#8B2D2D' }}>Articles</h2>
          <div>
            {user && <Link href="/dashboard/new" className="btn btn-danger me-2">New Article</Link>}
            <Link href="/" className="btn btn-outline-secondary">Home</Link>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <input className="form-control" placeholder="Search by title or author" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="col-md-3">
            <input className="form-control" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="col-md-3 text-end">
            <button className="btn btn-outline-danger" onClick={() => { setQ(''); setDate(''); }}>Clear</button>
          </div>
        </div>

        <div>
          {filtered.length === 0 && <div className="text-muted">No articles found.</div>}
          {filtered.map(a => (
            <ArticleCard key={a.id} article={a} onOpenComments={() => {
              // navigate to article page and open comment is handled there.
              window.location.href = `/dashboard/articles/${a.id}`;
            }} />
          ))}
        </div>
      </main>
    </>
  );
}
