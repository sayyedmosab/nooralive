import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Language } from '../types';

interface RubiksEntryProps {
  language: Language;
}

export function RubiksEntry({ language }: RubiksEntryProps) {
  const navigate = useNavigate();

  // If user has seen the animation before, skip directly to login
  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem('josoor_seen_rubiks');
      if (hasSeen) {
        navigate('/experience/login', { replace: true });
      }
    } catch {}
  }, [navigate]);

  const handleSkip = () => {
    try { localStorage.setItem('josoor_seen_rubiks', 'true'); } catch {}
    navigate('/experience/login');
  };

  return (
    <div className="rubiks-iframe-wrapper fixed inset-0 w-full h-full overflow-hidden">
      {/* Rubiks animation iframe (transparent, behind content) */}
      <iframe
        src="/rubiks-standalone-reset/index.html"
        title="Rubiks Experience"
        className="rubiks-iframe"
        aria-hidden
      />

      {/* Minimal overlay controls */}
      <div className="relative z-10 flex items-center justify-center w-full h-full pointer-events-none">
        <div className="text-center text-white max-w-4xl px-8 pointer-events-auto">
          <h1 className="mb-4 text-shadow-glow" style={{ fontFamily: 'Allerta Stencil, sans-serif' }}>
            JOSOOR
          </h1>
          <h2 className="text-blue-400 uppercase tracking-wider mb-8 text-2xl">
            {language === 'ar' ? 'جسر التحول الإدراكي' : 'The Cognitive Transformation Bridge'}
          </h2>

          <button
            onClick={handleSkip}
            className="px-8 py-3 rounded-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/50"
          >
            {language === 'ar' ? 'تخطي والدخول' : 'Skip to Experience'}
          </button>
        </div>
      </div>
    </div>
  );
}
