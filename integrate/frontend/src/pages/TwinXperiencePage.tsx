import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { Language } from '../types';
import { QuickActionsMenu } from '../components/noor/QuickActionsMenu';
import { NoorUniversalPortal } from '../components/NoorUniversalPortal';
import { NoorWalkthrough } from '../components/NoorWalkthrough';
import { SimpleToggle as Toggle } from '../components/ui/simple-toggle';

interface TwinXperiencePageProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isAuthenticated: boolean;
}

const navigationItems = [
  { id: 'demo', label: { en: 'Demo', ar: 'عرض' } },
  { id: 'twin-science', label: { en: 'TwinScience', ar: 'علم التوأم' } },
  { id: 'twin-studio', label: { en: 'TwinStudio', ar: 'استودي�� التوأم' } },
  { id: 'offerings', label: { en: 'Offerings', ar: 'العروض' } },
  { id: 'origins', label: { en: 'Origins', ar: 'الأصول' } },
];

export function TwinLifePage({ language, onLanguageChange, isAuthenticated }: TwinXperiencePageProps) {
  const location = useLocation();
  const isEmbedded = new URLSearchParams(location.search).get('embedded') === 'true';
  const [showWalkthrough, setShowWalkthrough] = useState(() => {
    try {
      const hasSeenWalkthrough = localStorage.getItem('josoor_walkthrough_seen');
      return !hasSeenWalkthrough;
    } catch {
      return true;
    }
  });
  const [activeNav, setActiveNav] = useState<string>('');

  // beforeunload prompt for anonymous users
  useEffect(() => {
    if (!isAuthenticated) {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = language === 'en'
          ? 'Your work is not saved. If you want to return to it, please register.'
          : 'عملك غير محفوظ. إذا كنت تريد العودة إليه، يرجى التسجيل.';
      };
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    }
  }, [isAuthenticated, language]);

  const handleLogout = () => {
    localStorage.removeItem('josoor_authenticated');
    window.location.href = '/';
  };

  const handleWalkthroughComplete = () => {
    setShowWalkthrough(false);
    try {
      localStorage.setItem('josoor_walkthrough_seen', 'true');
    } catch {
      // localStorage not available
    }
  };

  const handleNavigation = (navId: string) => {
    setActiveNav(navId);

    // Send message to Noor portal to trigger specific content
    const noorPortalElement = document.querySelector('.noor-universal-portal') as HTMLElement;
    if (noorPortalElement) {
      const prompts: { [key: string]: { en: string; ar: string } } = {
        demo: {
          en: 'Show me the experience the transformation - I want to see how a fictional entity uses the Digital Twin solution across 5 scenarios: Strategic Planning, Strategic Execution, Risk Management, Integrated Oversight, and Sector Operations.',
          ar: 'أرني تجربة التحول - أريد أن أرى كيف تستخدم كيان وهمي حل Twin الرقمي عبر 5 سيناريوهات: التخطيط الاستراتيجي، التنفيذ الاستراتيجي، إدارة المخاطر، الإشراف المتكامل، وعمليات القطاع.'
        },
        'twin-science': {
          en: 'Open the TwinScience canvas in full mode',
          ar: 'افتح قماش TwinScience في الوضع الكامل'
        },
        'twin-studio': {
          en: 'Help me build a use case - TwinStudio',
          ar: 'ساعدني في بناء حالة استخدام - TwinStudio'
        },
        'offerings': {
          en: 'Show me the Offerings - open the Chat Over Coffee page in full canvas mode',
          ar: 'أرني العروض - افتح صفحة Chat Over Coffee في وضع الكامل'
        },
        'origins': {
          en: 'Show me the Origins - open the Founders Message in full canvas mode',
          ar: 'أرني الأصول - افتح رسالة المؤسسين في وضع الكامل'
        }
      };

      // Dispatch custom event with the prompt
      window.dispatchEvent(new CustomEvent('nav-action', {
        detail: { action: navId, prompt: prompts[navId][language] }
      }));
    }

  };

  // Listen for parent postMessage to set language when embedded. If running as a full page, this will not be used.
  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      if (ev.data && ev.data.type === 'set-language' && (ev.data.language === 'en' || ev.data.language === 'ar')) {
        onLanguageChange(ev.data.language);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onLanguageChange]);

  // If loaded inside an iframe as an embedded experience, render only the portal content
  if (isEmbedded) {
    return (
      <div className="flex flex-col h-screen bg-slate-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex-1 relative noor-universal-portal">
          <NoorUniversalPortal language={language} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* HEADER: AI Twin Tech with Navigation */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-10 h-10 bg-[#1A2435] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AT</span>
          </div>
          <span className="text-lg font-semibold text-[#1A2435]">
            {language === 'en' ? 'AI Twin Tech' : 'آي تwin تك'}
          </span>
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex-1 flex items-center justify-center gap-8 mx-8">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`text-sm font-medium transition-colors ${
                activeNav === item.id
                  ? 'text-[#1A2435] border-b-2 border-[#1A2435]'
                  : 'text-gray-600 hover:text-[#1A2435]'
              }`}
            >
              {item.label[language]}
            </button>
          ))}
        </nav>

        {/* Right: Language Toggle + Auth */}
        <div className="flex items-center gap-6 flex-shrink-0">
          {/* Language Switcher */}
            <div className="flex items-center gap-2">
            <span className={`text-sm transition-opacity ${language === 'en' ? 'opacity-100 font-semibold' : 'opacity-50'}`}>
              EN
            </span>
            <Toggle
              pressed={language === 'ar'}
              onPressedChange={(isAr: boolean) => {
                try { localStorage.setItem('josoor_language', isAr ? 'ar' : 'en'); } catch (_) {}
                onLanguageChange(isAr ? 'ar' : 'en');
              }}
              aria-label="Toggle language"
              className="language-toggle"
            />
            <span className={`text-sm transition-opacity ${language === 'ar' ? 'opacity-100 font-semibold' : 'opacity-50'}`}>
              ع
            </span>
          </div>

          {/* Login/Logout */}
          <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-[#1A2435] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {language === 'en' ? 'Logout' : 'تسجيل الخروج'}
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
                <User className="w-4 h-4" />
                {language === 'en' ? 'Guest' : 'ضيف'}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN: Sidebar (Quick Actions) + Noor Portal */}
      <main className="flex-1 flex overflow-hidden">
        {/* Quick Actions Sidebar */}
        <aside className={`border-${language === 'ar' ? 'l' : 'r'} border-gray-200 bg-white overflow-y-auto`}>
          <QuickActionsMenu
            language={language}
            onActionClick={(command) => {
              console.log('Quick action clicked:', command);
            }}
          />
        </aside>

        {/* Noor Universal Portal */}
        <div className="flex-1 relative noor-universal-portal">
          <NoorUniversalPortal language={language} />
        </div>
      </main>

      {/* FOOTER: Thin row */}
      <footer className="h-12 bg-white border-t border-gray-200 flex items-center justify-center px-6">
        <div className="flex items-center gap-6 text-xs text-gray-500">
          <span>© 2025 AI Twin Tech</span>
          <span>•</span>
          <a href="#" className="hover:text-[#1A2435] transition-colors">
            {language === 'en' ? 'Privacy' : 'الخصوصية'}
          </a>
          <span>•</span>
          <a href="#" className="hover:text-[#1A2435] transition-colors">
            {language === 'en' ? 'Terms' : 'الشروط'}
          </a>
          <span>•</span>
          <a href="#" className="hover:text-[#1A2435] transition-colors">
            {language === 'en' ? 'Contact' : 'اتصل'}
          </a>
        </div>
      </footer>

      {/* Walkthrough (first-time visitors) */}
      {showWalkthrough && (
        <NoorWalkthrough
          language={language}
          onClose={handleWalkthroughComplete}
        />
      )}
    </div>
  );
}
