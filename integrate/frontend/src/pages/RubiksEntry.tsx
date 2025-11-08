import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../types';
import { Toggle } from '../components/ui/toggle';

interface RubiksEntryProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function RubiksEntry({ language, onLanguageChange }: RubiksEntryProps) {
  const navigate = useNavigate();
  const [canSkip, setCanSkip] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem('josoor_seen_rubiks') === 'true';
    if (seen) {
      navigate('/experience/login', { replace: true });
      return;
    }
    setTimeout(() => setCanSkip(true), 3000);
  }, [navigate]);

  const handleSkip = () => {
    try {
      localStorage.setItem('josoor_seen_rubiks', 'true');
    } catch {
      // localStorage not available
    }
    navigate('/experience/login', { replace: true });
  };

  const handleLanguageToggle = (isArabic: boolean) => {
    const newLanguage: Language = isArabic ? 'ar' : 'en';
    onLanguageChange(newLanguage);
  };

  const handleIframeLoad = () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    const style = doc.createElement('style');
    style.textContent = `
      html, body { background: #1A2435 !important; }
      .phase-overlay .phase-text-block h2 {
        color: #D4AF37 !important;
        text-shadow: 0 1px 3px rgba(0,0,0,0.8) !important;
      }
      .phase-overlay .phase-text-block p {
        color: #ffffff !important;
        text-shadow: 0 1px 3px rgba(0,0,0,0.8) !important;
      }
      .finale-enter-btn {
        background: linear-gradient(135deg, #D4AF37 0%, #E5C158 100%) !important;
        color: #1A2435 !important;
        box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3) !important;
      }
      .finale-enter-btn:hover {
        background: linear-gradient(135deg, #E5C158 0%, #D4AF37 100%) !important;
        box-shadow: 0 6px 24px rgba(212, 175, 55, 0.4) !important;
      }
      .finale-enter-btn:active {
        box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3) !important;
      }
      #stage { filter: sepia(0.75) hue-rotate(330deg) saturate(1.35) brightness(1.0) contrast(1.05); }
    `;
    doc.head.appendChild(style);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', margin: 0, padding: 0 }}>
      {/* Thin sticky header with controls */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'transparent',
        borderBottom: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 48,
        minHeight: 40,
        padding: '0 16px',
        boxSizing: 'border-box',
      }}>
        {/* Language toggle using Shadcn Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', marginRight: 0 }}>
          <span style={{
            fontSize: 14,
            fontWeight: language === 'en' ? 600 : 400,
            color: language === 'en' ? '#1A2435' : '#666',
            transition: 'color 0.2s',
          }}>
            EN
          </span>
          <Toggle
            pressed={language === 'ar'}
            onPressedChange={handleLanguageToggle}
            aria-label="Toggle language"
            className="language-toggle"
          />
          <span style={{
            fontSize: 16,
            fontWeight: language === 'ar' ? 600 : 400,
            color: language === 'ar' ? '#1A2435' : '#666',
            transition: 'color 0.2s',
          }}>
            ع
          </span>
        </div>

        {canSkip && (
          <button onClick={handleSkip} style={{ padding: '8px 16px', fontWeight: 600, border: '1px solid #ccc', borderRadius: 4, marginLeft: 16 }}>
            Skip
          </button>
        )}
      </div>

      {/* Fullscreen iframe below header */}
      <div className="rubiks-iframe-wrapper" style={{ flex: 1, minHeight: 0 }}>
        <iframe
          ref={iframeRef}
          onLoad={handleIframeLoad}
          src={language === 'ar' ? '/rubiks-standalone-reset/index-ar.html' : '/rubiks-standalone-reset/index.html'}
          title="Rubik's Cube Animation"
          className="rubiks-iframe interactive"
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </div>
    </div>
  );
}
