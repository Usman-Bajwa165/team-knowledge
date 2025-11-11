import { useState } from 'react';
import { useAuth } from '../lib/auth';
import Router from 'next/router';

export default function Register(){
  const { register } = useAuth();
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [note,setNote] = useState(null);
  const [loading,setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    setLoading(true);
    const r = await register({ name, email, password });
    setLoading(false);
    if (!r.ok) return setNote(r.message || 'Register failed');
    setNote('Account created. Please sign in.');
    setTimeout(()=>Router.push('/login'), 900);
  }

  return (
    <div className="container container-centered py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow-sm">
            <h3>Create account</h3>
            <form onSubmit={submit} className="mt-3">
              <div className="mb-3"><label className="form-label small">Full name</label><input className="form-control" value={name} onChange={e=>setName(e.target.value)} /></div>
              <div className="mb-3"><label className="form-label small">Email</label><input className="form-control" value={email} onChange={e=>setEmail(e.target.value)} /></div>
              <div className="mb-3"><label className="form-label small">Password</label><input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} /></div>
              <div className="d-flex justify-content-between align-items-center">
                <button className="btn btn-primary" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
                <a href="/login" className="small">Sign in</a>
              </div>
              {note && <div className="alert alert-info mt-3">{note}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
