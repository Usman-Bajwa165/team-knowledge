import { useState } from 'react';
import { useAuth } from '../lib/auth';
import Router from 'next/router';

export default function Login(){
  const { login } = useAuth();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [note,setNote] = useState(null);
  const [loading,setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    setLoading(true);
    const r = await login(email, password);
    setLoading(false);
    if (!r.ok) return setNote(r.message);
    Router.push('/dashboard');
  }

  return (
    <div className="container container-centered py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card p-4 shadow-sm">
            <h3>Sign in</h3>
            <form onSubmit={submit} className="mt-3">
              <div className="mb-3"><label className="form-label small">Email</label><input required className="form-control" value={email} onChange={e=>setEmail(e.target.value)} /></div>
              <div className="mb-3"><label className="form-label small">Password</label><input required type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} /></div>

              <div className="d-flex justify-content-between align-items-center">
                <button className="btn btn-primary" disabled={loading}>{loading ? 'Signing…' : 'Sign in'}</button>
                <a href="/forgot-password" className="small">Forgot password?</a>
              </div>

              {note && <div className="alert alert-danger mt-3">{note}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
