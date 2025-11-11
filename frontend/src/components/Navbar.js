import Link from 'next/link';
import { useAuth } from '../lib/auth';
import React from 'react';

export default function NavBar(){
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container container-centered py-2">
        <Link href="/" className="d-flex align-items-center text-decoration-none">
            <span className="brand-badge me-3">TK</span>
            <div className="d-flex flex-column">
              <span className="fw-bold brand-text" style={{ color: 'var(--muted-900)' }}>Team Knowledge</span>
              <small className="text-muted">Articles & comments for teams</small>
            </div>
        </Link>

        <div className="ms-auto d-flex align-items-center gap-2">
          <Link href="/" className="btn btn-sm btn-outline-secondary">Home</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="btn btn-sm btn-outline-secondary">Dashboard</Link>
              <div className="dropdown">
                <button className="btn btn-sm btn-light dropdown-toggle" data-bs-toggle="dropdown">
                  <i className="fa fa-user me-2" /> {user.name ?? user.email}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link href="/profile" className="dropdown-item">Profile</Link></li>
                  {user.role === 'admin' && <li><Link href="/admin/users" className="dropdown-item">User Admin</Link></li>}
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" onClick={logout}>Logout</button></li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-sm btn-outline-primary">Sign in</Link>
              <Link href="/register" className="btn btn-sm btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
