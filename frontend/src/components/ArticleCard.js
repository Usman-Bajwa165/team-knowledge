import Link from 'next/link';
import React from 'react';

export default function ArticleCard({ article, onOpenComments, currentUser }) {
  const created = new Date(article.createdAt || article.createdAt);
  const dateLabel = created.toLocaleDateString(undefined, { day:'2-digit', month:'short', year:'numeric' });
  const timeLabel = created.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' });

  const isAuthor = currentUser && (currentUser.id === article.author?.id);
  const isAdmin = currentUser && currentUser.role === 'admin';

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between">
          <div>
            <h5 className="card-title">{article.title}</h5>
            <div className="small text-muted">
              {article.author?.name ?? article.author?.email} · {dateLabel} · {timeLabel} · { (article.comments || []).length } comments
            </div>
            <p className="mt-2">{(article.content || '').slice(0, 240)}{(article.content || '').length > 240 ? '...' : ''}</p>
          </div>
          <div className="d-flex flex-column align-items-end gap-2">
            <Link href={`/dashboard/articles/${article.id}`} className="btn btn-sm btn-outline-secondary">Open</Link>
            <button className="btn btn-sm btn-outline-primary" onClick={() => onOpenComments(article.id)}><i className="fa fa-comments me-1" /> Comments</button>
            {(isAuthor || isAdmin) && (
              <div className="mt-2">
                <button className="btn btn-sm btn-danger me-2">Delete</button>
                <button className="btn btn-sm btn-secondary">Edit</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
