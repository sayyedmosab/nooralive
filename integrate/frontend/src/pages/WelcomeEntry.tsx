import React, { useEffect, useState, useRef } from 'react';
import { SimpleToggle as Toggle } from '../components/ui/simple-toggle';
import LoginPage from './LoginPage';

export default function WelcomeEntry() {  const [showLogin, setShowLogin] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  useEffect(() => {
    const seen = localStorage.getItem('josoor_seen_cube') === 'true';
    if (seen) setCanSkip(true);
    else setTimeout(() => setCanSkip(true), 3000);
  }, []);

  const handleSkip = () => {
    localStorage.setItem('josoor_seen_cube', 'true');
    setShowLogin(true);
  };

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const handleIframeLoad = () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    const style = doc.createElement('style');
    style.textContent = `
      html, body { background: #1A2435 !important; }
      .phase-overlay .phase-text-block h2,
      .finale-columns h2 { color: #D4AF37 !important; }
      .finale-left-column, .finale-right-column { border-color: rgba(212,175,55,0.3) !important; }
      .finale-columns li { border-bottom-color: rgba(212,175,55,0.2) !important; }
      .finale-enter-btn {
        background: linear-gradient(135deg, #D4AF37 0%, #B8960F 100%) !important;
        box-shadow: 0 4px 16px rgba(212,175,55,0.3) !important;
      }
      .finale-enter-btn:hover {
        background: linear-gradient(135deg, #B8960F 0%, #D4AF37 100%) !important;
        box-shadow: 0 6px 24px rgba(212,175,55,0.4) !important;
      }
      #stage { filter: sepia(0.75) hue-rotate(330deg) saturate(1.35) brightness(1.0) contrast(1.05); }
    `;
    doc.head.appendChild(style);
  };

  const handleLanguageChange = (next?: 'en' | 'ar') => {
    // Compute next language
    const nextLang = next || (language === 'en' ? 'ar' : 'en');

    try {
      localStorage.setItem('josoor_language', nextLang);
    } catch {}
    document.documentElement.lang = nextLang;
    document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';

    setLanguage(nextLang);

    // If the iframe currently hosts the experience, instruct it to switch language instead of swapping pages.
    const iframe = iframeRef.current;
    try {
      const src = iframe?.src || '';
      if (src.includes('/experience')) {
        iframe?.contentWindow?.postMessage({ type: 'set-language', language: nextLang }, '*');
        return;
      }
    } catch (_) {}

    // Otherwise, update the Rubiks iframe source to the selected language
    if (iframe) {
      iframe.src = nextLang === 'ar' ? '/rubiks-standalone-reset/index-ar.html' : '/rubiks-standalone-reset/index.html';
    }
  };

  return (
    // Render the Rubiks iframe edge-to-edge. Header and controls are moved into the standalone Rubiks HTML.
    <div style={{ height: '100vh', margin: 0, padding: 0 }}>
      <iframe
        ref={iframeRef}
        onLoad={handleIframeLoad}
        src={language === 'ar' ? '/rubiks-standalone-reset/index-ar.html' : '/rubiks-standalone-reset/index.html'}
        title="Rubik's Cube Animation"
        className="rubiks-iframe interactive"
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      />
    </div>
  );
}
