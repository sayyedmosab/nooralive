import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Language } from './types';
import WelcomeEntry from './pages/WelcomeEntry';
import { TwinLifePage } from './pages/TwinXperiencePage';
import { Toaster } from './components/ui/sonner';

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return null;
}

function AppContent() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('josoor_language');
      return (saved as Language) || 'en';
    } catch {
      return 'en';
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('josoor_authenticated');
      return saved === 'true';
    } catch {
      return false;
    }
  });


  useEffect(() => {
    try {
      localStorage.setItem('josoor_language', language);
    } catch {
      // localStorage not available
    }
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // Listen for iframe postMessage to navigate. If a rubiks iframe exists, load the experience inside it
  // so the parent header remains visible. Otherwise fall back to SPA navigation.
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (
        event.data &&
        event.data.type === 'navigate' &&
        (event.data.route === 'twinlife' || event.data.route === '/experience')
      ) {
        // Simplified behavior: always perform SPA navigation to /experience.
        navigate('/experience');
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  // Redirect old hash-based finale links (e.g., #/twinscience, #/twinlab) to the login route
  useEffect(() => {
    const handleHashRedirect = () => {
      if (window.location.hash && window.location.hash.startsWith('#/')) {
        try {
          localStorage.setItem('josoor_seen_rubiks', 'true');
        } catch {}
        navigate('/experience/login', { replace: true });
      }
    };

    // Check immediately on mount and also on future hash changes
    handleHashRedirect();
    window.addEventListener('hashchange', handleHashRedirect);
    return () => window.removeEventListener('hashchange', handleHashRedirect);
  }, [navigate]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    try {
      localStorage.setItem('josoor_authenticated', 'true');
    } catch {
      // localStorage not available
    }
  };

  const handleSkip = () => {
    setIsAuthenticated(true);
    // Don't save to localStorage for guests
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <ScrollToTop />

      <Routes>
        {/* Route 1: Welcome Entry (Rubik's + Login) */}
        <Route path="/" element={<WelcomeEntry />} />

        {/* Route 2: Main Experience (Noor Portal) */}
        <Route 
          path="/experience" 
          element={
            <TwinLifePage 
              language={language} 
              onLanguageChange={setLanguage}
              isAuthenticated={isAuthenticated}
            />
          } 
        />

        {/* Catch-all: Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
