import Link from 'next/link';

export default function Home(){
  return (
    <div className="container container-centered py-5">
      <div className="row align-items-center">
        <div className="col-md-6">
          <h1 className="display-5 fw-bold">Team Knowledge</h1>
          <p className="lead text-muted">Write longform articles, leave contextual comments, and build a searchable internal knowledge base for your team.</p>
          <div className="mt-4">
            <Link href="/register" className="btn btn-primary btn-lg me-2">Get started</Link>
            <Link href="/login" className="btn btn-outline-secondary btn-lg">Sign in</Link>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-4 shadow-sm">
            <h5>Why Team Knowledge?</h5>
            <ul>
              <li>Structured articles for onboarding & docs</li>
              <li>Inline comments and discussions</li>
              <li>Search and tagging (coming soon)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
