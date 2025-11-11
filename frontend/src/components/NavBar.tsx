// frontend/src/components/NavBar.tsx
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import Router from 'next/router';

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: 'linear-gradient(90deg,#8B2D2D,#333)' }}>
      <div className="container">
        <Link href="/" className="navbar-brand d-flex align-items-center text-decoration-none">
          <div className="me-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, background: '#f44336', color: '#fff', fontWeight: 700 }}>
            TK
          </div>
          <div className="d-flex flex-column">
            <span style={{ fontWeight: 700 }}>Team Knowledge</span>
            <small className="text-muted" style={{ fontSize: 11 }}>Articles & comments for teams</small>
          </div>
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#tkNav" aria-controls="tkNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="tkNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item me-3">
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
            </li>

            {!user ? (
              <>
                <li className="nav-item me-2">
                  <Link href="/login" className="btn btn-outline-light btn-sm">Login</Link>
                </li>
                <li className="nav-item">
                  <Link href="/register" className="btn btn-light btn-sm" style={{ color: '#8B2D2D' }}>Register</Link>
                </li>
              </>
            ) : (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle d-flex align-items-center btn btn-none"
                  id="userMenu"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ background: 'transparent', border: 'none', padding: 0 }}
                >
                  <i className="fa fa-user-circle fa-lg me-2" />
                  <span style={{ color: 'white' }}>{user.name ?? user.email}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
                  {user.role === 'admin' && <li><Link href="/admin/users" className="dropdown-item">Admin: Users</Link></li>}
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" onClick={() => { logout(); }}>Logout</button></li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
