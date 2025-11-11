// frontend/src/pages/index.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="container py-5">
      <div className="row align-items-center">
        <div className="col-md-6">
          <h1 className="display-5" style={{ color: '#8B2D2D' }}>Team Knowledge</h1>
          <p className="lead text-muted">
            Write longform, share insights, and keep your team’s knowledge searchable and evergreen.
          </p>

          <ul className="list-unstyled">
            <li className="mb-2"><i className="fa fa-check-circle text-danger me-2" /> Autosave drafts</li>
            <li className="mb-2"><i className="fa fa-check-circle text-danger me-2" /> Inline comments & discussions</li>
            <li className="mb-2"><i className="fa fa-check-circle text-danger me-2" /> Searchable team knowledge base</li>
          </ul>

          <div className="mt-4">
            <Link href="/register" className="btn btn-danger btn-lg me-2">Get started</Link>
            <Link href="/login" className="btn btn-outline-secondary btn-lg">Sign in</Link>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h5 className="card-title">Latest articles</h5>
              <p className="text-muted">Visit the dashboard to browse articles and start contributing.</p>
              <Link href="/dashboard" className="btn btn-outline-danger">Go to dashboard</Link>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-5" />

      <section>
        <h3>About the app</h3>
        <p className="text-muted">Team Knowledge lets teams create, share, and comment on long-form articles. Built for collaboration, discoverability and longevity.</p>
      </section>
    </main>
  );
}
