// frontend/src/pages/dashboard/index.tsx
import React, { useEffect, useState } from "react";
import ArticleCard from "../../components/ArticleCard";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import Link from "next/link";

export default function Dashboard() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [date, setDate] = useState<string>("");

  async function load() {
    let path = "/knowledge/articles";
    // support server-side filters via query string if backend supported; otherwise filter client-side.
    const r = await apiFetch(path);
    if (!r.ok) return;
    const data = await r.json();
    setArticles(data);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = articles.filter((a) => {
    const matchesQ =
      !q ||
      a.title?.toLowerCase().includes(q.toLowerCase()) ||
      a.author?.name?.toLowerCase().includes(q.toLowerCase()) ||
      a.author?.email?.toLowerCase().includes(q.toLowerCase());
    const matchesDate =
      !date || new Date(a.createdAt).toISOString().slice(0, 10) === date;
    return matchesQ && matchesDate;
  });

  // scroll area styles: keeps navbar untouched and only articles list scrollable.
  const articlesContainerStyle: React.CSSProperties = {
    maxHeight: "calc(100vh - 220px)", // tweak if your navbar is taller/shorter
    overflowY: "auto",
    paddingRight: "8px",
  };

  return (
    <>
      <main className="container py-4">
        {/* single row: title, search, date, clear/new/home buttons */}
        <div className="row align-items-center mb-3 g-2">
          <div className="col-auto">
            <h2 style={{ color: "#8B2D2D", margin: 0 }}>Articles</h2>
          </div>

          <div className="col-md-5 col-sm-12">
            <input
              className="form-control"
              placeholder="Search by title or author"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="col-md-2 col-sm-6">
            <input
              className="form-control"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="col-auto ms-auto d-flex gap-2">
            <button
              className="btn btn-outline-danger"
              onClick={() => {
                setQ("");
                setDate("");
              }}
            >
              Clear
            </button>

            <button
              className="btn btn-outline-primary"
              onClick={() => {
                load();
              }}
            >
              Refresh
            </button>

            {user && (
              <Link href="/dashboard/new" className="btn btn-danger">
                New Article
              </Link>
            )}

            <Link href="/" className="btn btn-outline-secondary">
              Home
            </Link>
          </div>
        </div>

        {/* articles list: scrollable area so navbar stays put */}
        <div style={articlesContainerStyle}>
          {filtered.length === 0 && (
            <div className="text-muted">No articles found.</div>
          )}
          {filtered.map((a) => (
            <div key={a.id} className="mb-3">
              <ArticleCard
                article={a}
                onOpenComments={() => {
                  // navigate to article page and open comment is handled there.
                  window.location.href = `/dashboard/articles/${a.id}`;
                }}
              />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
