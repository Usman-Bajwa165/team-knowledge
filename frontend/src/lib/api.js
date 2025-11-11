export async function apiFetch(path, opts = {}) {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('tk_access') : null;

  const { headers: incomingHeaders = {}, body: incomingBody, ...rest } = opts;

  const headers = {
    'Content-Type': 'application/json',
    ...incomingHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchOpts = { ...rest, headers };

  if (incomingBody !== undefined) {
    const isFormData = typeof FormData !== 'undefined' && incomingBody instanceof FormData;
    if (!isFormData && typeof incomingBody !== 'string') {
      try {
        fetchOpts.body = JSON.stringify(incomingBody);
      } catch {
        fetchOpts.body = incomingBody;
      }
    } else {
      fetchOpts.body = incomingBody;
      if (isFormData) {
        // remove content-type so browser sets boundary
        const { ['Content-Type']: _ct, ...restHeaders } = headers;
        fetchOpts.headers = restHeaders;
      }
    }
  }

  const url = `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  return fetch(url, fetchOpts);
}
