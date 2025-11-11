// frontend/src/pages/_app.tsx
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "../lib/auth";
import NavBar from "../components/NavBar";
import Head from "next/head";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  // import bootstrap JS on client only
  useEffect(() => {
    // load bootstrap bundle (contains Popper) dynamically to avoid SSR issues
    import("bootstrap/dist/js/bootstrap.bundle");
  }, []);

  return (
    <AuthProvider>
      <Head>
        <title>Team Knowledge</title>
        <meta
          name="description"
          content="Team Knowledge — articles & comments for teams"
        />
        {/* Font Awesome CDN */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
      </Head>
      <NavBar />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
