import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import FeaturesPage from './components/FeaturesPage';
import DashboardPage from './components/DashboardPage';
import MoneyManagementPage from './components/MoneyManagementPage';
import GamesPage from './components/GamesPage';
import AboutPage from './components/AboutPage';
import LoginModal from './components/LoginModal';
import QuizModal from './components/QuizModal';
import { Toaster } from './components/ui/sonner';
import { Language } from './utils/translations';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [moneyTab, setMoneyTab] = useState<string>('categories');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [user, setUser] = useState<{
    name: string;
    mobile: string;
    email: string;
    coins: number;
    level: string;
    completedQuiz: boolean;
  } | null>(null);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Initialize language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'hi', 'mr'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Initialize user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('fintechUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const handleGetStarted = () => {
    if (!user) {
      setShowLoginModal(true);
      // Prevent body scroll when modal opens
      document.body.style.overflow = 'hidden';
    }
  };

  const handleLoginSuccess = (userData: { name: string; mobile: string; email: string }) => {
    setShowLoginModal(false);
    setShowQuizModal(true);
    // Keep body scroll locked for quiz modal
    // Save temporary user data (will be completed after quiz)
    const tempUser = {
      name: userData.name,
      mobile: userData.mobile,
      email: userData.email,
      coins: 0,
      level: 'Beginner',
      completedQuiz: false,
    };
    setUser(tempUser);
  };

  const handleQuizComplete = (quizResult: { coins: number; level: string }) => {
    if (user) {
      const updatedUser = {
        ...user,
        coins: quizResult.coins,
        level: quizResult.level,
        completedQuiz: true,
      };
      setUser(updatedUser);
      localStorage.setItem('fintechUser', JSON.stringify(updatedUser));
    }
    setShowQuizModal(false);
    // Restore body scroll when modal closes
    document.body.style.overflow = 'unset';
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fintechUser');
    setCurrentPage('home');
  };

  const handleCoinsUpdate = (newCoins: number) => {
    if (user) {
      const updatedUser = { ...user, coins: newCoins };
      setUser(updatedUser);
      localStorage.setItem('fintechUser', JSON.stringify(updatedUser));
    }
  };

  const handleNavigateToMoneyManager = (tab: string) => {
    setMoneyTab(tab);
    setCurrentPage('money');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <LandingPage onGetStarted={handleGetStarted} isLoggedIn={!!user} language={language} />;
      case 'features':
        return <FeaturesPage language={language} />;
      case 'dashboard':
        return <DashboardPage 
          user={user} 
          language={language} 
          onNavigateToMoneyManager={handleNavigateToMoneyManager}
          onCoinsUpdate={handleCoinsUpdate}
        />;
      case 'money':
        return <MoneyManagementPage 
          user={user} 
          language={language} 
          onCoinsUpdate={handleCoinsUpdate} 
          initialTab={moneyTab}
        />;
      case 'games':
        return <GamesPage user={user} onCoinsUpdate={handleCoinsUpdate} language={language} />;
      case 'about':
        return <AboutPage language={language} />;
      default:
        return <LandingPage onGetStarted={handleGetStarted} isLoggedIn={!!user} language={language} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        onLogout={handleLogout}
        onGetStarted={handleGetStarted}
        language={language}
        onLanguageChange={handleLanguageChange}
      />
      
      <main className="min-h-screen">
        {renderPage()}
      </main>

      {showLoginModal && (
        <LoginModal
          onClose={() => {
            setShowLoginModal(false);
            document.body.style.overflow = 'unset';
          }}
          onLoginSuccess={handleLoginSuccess}
          language={language}
        />
      )}

      {showQuizModal && (
        <QuizModal
          userName={user?.name || ''}
          onClose={() => {
            setShowQuizModal(false);
            document.body.style.overflow = 'unset';
          }}
          onComplete={handleQuizComplete}
          language={language}
        />
      )}

      <Toaster />
    </div>
  );
}
