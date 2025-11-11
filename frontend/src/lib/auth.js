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
      const j = await r.json();
      if (!r.ok) return { ok: false, message: j?.message || j?.error || 'Login failed' };
      if (j.accessToken) localStorage.setItem('tk_access', j.accessToken);
      await refreshUser();
      return { ok: true };
    } catch {
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
