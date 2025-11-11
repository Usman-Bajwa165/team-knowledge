import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { apiFetch } from '../../lib/api';
import Router from 'next/router';

export default function AdminUsers(){
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(()=> {
    if (user && user.role !== 'admin') Router.push('/');
    if (!user) return;
    load();
  }, [user]);

  async function load() {
    const r = await apiFetch('/admin/users');
    if (!r.ok) return;
    const j = await r.json();
    setUsers(j);
  }

  async function toggleAdmin(u) {
    await apiFetch(`/admin/users/${u.id}/role`, { method:'PATCH', body: { role: u.role === 'admin' ? 'user' : 'admin' }});
    load();
  }

  async function removeUser(u){
    if (!confirm('Delete this user?')) return;
    await apiFetch(`/admin/users/${u.id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="container container-centered py-5">
      <h3>Users</h3>
      <table className="table mt-3">
        <thead><tr><th>Name</th><th>Email</th><th>Articles</th><th>Role</th><th>Actions</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u._count?.KnowledgeArticle ?? 0}</td>
              <td>{u.role}</td>
              <td>
                <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => toggleAdmin(u)}>{u.role === 'admin' ? 'Demote' : 'Promote'}</button>
                <button className="btn btn-sm btn-danger" onClick={() => removeUser(u)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
