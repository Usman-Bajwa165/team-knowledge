// frontend/src/pages/_app.js
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/globals.css';
import { AuthProvider } from '../lib/auth';
import NavBar from '../components/Navbar';
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // load bootstrap JS only in browser (prevents SSR errors)
    if (typeof window !== 'undefined') {
      import('bootstrap/dist/js/bootstrap.bundle.min.js')
        .catch((e) => {
          // don't crash the app if bootstrap fails to load
          console.warn('Bootstrap JS load failed', e);
        });
    }
  }, []);

  return (
    <AuthProvider>
      <NavBar />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
