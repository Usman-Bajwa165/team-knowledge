// lib/auth.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from './api';
import Router from 'next/router';

const AuthContext = createContext();

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  async function refreshUser() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('tk_access') : null;
    if (!token) {
      setUser(null);
      setLoadingUser(false);
      return;
    }
    try {
      const r = await apiFetch('/auth/me', { method: 'GET' });
      if (!r.ok) {
        setUser(null);
        setLoadingUser(false);
        return;
      }
      const j = await r.json();
      setUser(j.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }

  useEffect(() => { refreshUser(); }, []);

  async function login(email, password) {
    try {
      const r = await apiFetch('/auth/login', { method: 'POST', body: { email, password }});
      // try to parse json safely
      let j = null;
      try { j = await r.json(); } catch (e) { j = null; }

      // if HTTP-level failure -> return message from body or generic
      if (!r.ok) {
        const msg = j?.message || j?.error || `Login failed (status ${r.status})`;
        return { ok: false, message: msg };
      }

      // require an accessToken to consider login successful
      if (!j || !j.accessToken) {
        const msg = j?.message || j?.error || 'Invalid credentials';
        return { ok: false, message: msg };
      }

      // store token and fetch user immediately so callers get a consistent state
      localStorage.setItem('tk_access', j.accessToken);

      // fetch user info synchronously
      try {
        const meRes = await apiFetch('/auth/me', { method: 'GET' });
        if (meRes.ok) {
          const meJson = await meRes.json();
          setUser(meJson.user ?? null);
        } else {
          // if /me failed even though we have token, still mark failure (optional)
          // but we still return ok: true because access token was returned
          setUser(null);
        }
      } catch {
        setUser(null);
      }

      return { ok: true };
    } catch (err) {
      return { ok: false, message: 'Network error' };
    }
  }

  async function register(payload) {
    try {
      const r = await apiFetch('/auth/register', { method:'POST', body: payload });
      const j = await r.json();
      if (!r.ok) return { ok: false, message: j?.message || 'Register failed' };
      return { ok: true };
    } catch {
      return { ok: false, message: 'Network error' };
    }
  }

  function logout() {
    localStorage.removeItem('tk_access');
    setUser(null);
    Router.push('/');
  }

  return (
    <AuthContext.Provider value={{ user, loadingUser, login, logout, register, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
