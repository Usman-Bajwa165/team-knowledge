// frontend/src/components/ArticleCard.tsx
import Link from 'next/link';
import { formatDate, formatTime } from '../lib/format';

export default function ArticleCard({ article, onOpenComments }: { article: any; onOpenComments?: () => void }) {
  const snippet = article.content?.slice(0, 220) + (article.content?.length > 220 ? '…' : '');
  const authorName = article.author?.name || article.author?.email || 'Unknown';

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h5 className="card-title mb-1">{article.title}</h5>
            <div className="small text-muted">By <strong>{authorName}</strong> · {formatDate(article.createdAt)} · {formatTime(article.createdAt)}</div>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-danger" title="Open comments" onClick={onOpenComments}><i className="fa fa-comments" /></button>
            <Link href={`/dashboard/articles/${article.id}`} className="btn btn-sm btn-outline-secondary">Open</Link>
          </div>
        </div>

        <p className="card-text mt-3">{snippet}</p>
      </div>
    </div>
  );
}
