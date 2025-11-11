import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import CommentSection from '../../../components/CommentSection';
import Link from 'next/link';

export default function ArticleView(){
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState(null);

  useEffect(() => {
    if (!id) return;
    load();
  }, [id]);

  async function load(){
    const r = await apiFetch(`/knowledge/articles/${id}`);
    if (!r.ok) return;
    const j = await r.json();
    setArticle(j);
  }

  if (!article) return <div className="container container-centered py-5">Loading…</div>;

  return (
    <div className="container container-centered py-5">
      <Link href="/dashboard" className="btn btn-sm btn-link mb-3"><i className="fa fa-arrow-left" /> Back to dashboard</Link>
      <div className="card p-4 shadow-sm">
        <h2>{article.title}</h2>
        <div className="small text-muted mb-3">{article.author?.name ?? article.author?.email} · {new Date(article.createdAt).toLocaleString()}</div>
        <div style={{ whiteSpace:'pre-wrap' }}>{article.content}</div>
      </div>

      <CommentSection articleId={article.id} onClose={() => { /* nothing */ }} />
    </div>
  );
}
