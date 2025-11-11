import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { apiFetch } from '../../lib/api';
import ArticleCard from '../../components/ArticleCard';
import Router from 'next/router';
import CommentSection from '../../components/CommentSection';

export default function Dashboard(){
  const { user, loadingUser } = useAuth();
  const [articles, setArticles] = useState([]);
  const [openCommentsFor, setOpenCommentsFor] = useState(null);

  useEffect(() => {
    if (!loadingUser && !user) {
      Router.push('/login');
      return;
    }
    load();
  }, [loadingUser, user]);

  async function load(){
    const r = await apiFetch('/knowledge/articles');
    if (!r.ok) return;
    const j = await r.json();
    setArticles(j);
  }

  return (
    <div className="container container-centered py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Articles</h3>
        <div>
          <a href="/dashboard/create" className="btn btn-primary">New article</a>
        </div>
      </div>

      <div>
        {articles.map(a => (
          <div key={a.id}>
            <ArticleCard article={a} onOpenComments={(id)=>setOpenCommentsFor(id)} currentUser={user} />
            {openCommentsFor === a.id && (
              <CommentSection articleId={a.id} onClose={()=>setOpenCommentsFor(null)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
