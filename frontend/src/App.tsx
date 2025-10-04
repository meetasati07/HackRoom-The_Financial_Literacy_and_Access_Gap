import React from 'react';
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
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from './components/ui/sonner';
import { Language } from './utils/translations';
import apiService, { User } from './services/api';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [moneyTab, setMoneyTab] = useState<string>('categories');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Initialize user from API
  useEffect(() => {
    const initializeUser = async () => {
      setIsLoading(true);
      if (apiService.isAuthenticated()) {
        try {
          const response = await apiService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data.user);
          } else {
            // Clear invalid token
            apiService.clearToken();
          }
        } catch (error) {
          console.error('Failed to get current user:', error);
          apiService.clearToken();
        }
      }
      setIsLoading(false);
    };

    initializeUser();
  }, []); // Empty dependency array to prevent infinite loops

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

  const handleLoginSuccess = async (userData: { name: string; mobile: string; email: string }) => {
    setShowLoginModal(false);
    document.body.style.overflow = 'unset'; // Restore scroll
    
    // Get the full user data from API
    try {
      const response = await apiService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data.user);
        setCurrentPage('dashboard'); // Navigate to dashboard after successful login
      }
    } catch (error) {
      console.error('Failed to get user data:', error);
    }
  };

  const handleRegistrationSuccess = async (userData: { name: string; mobile: string; email: string }) => {
    setShowLoginModal(false);
    document.body.style.overflow = 'unset'; // Restore scroll
    setShowQuizModal(true);
    
    // Get the full user data from API
    try {
      const response = await apiService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to get user data:', error);
    }
  };

  const handleQuizComplete = async (quizResult: { coins: number; level: string }) => {
    try {
      const response = await apiService.completeQuiz(quizResult.coins, quizResult.level);
      if (response.success && response.data) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to complete quiz:', error);
    }
    
    setShowQuizModal(false);
    // Restore body scroll when modal closes
    document.body.style.overflow = 'unset';
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setUser(null);
    setCurrentPage('home');
  };

  const handleCoinsUpdate = async (newCoins: number) => {
    try {
      const response = await apiService.updateCoins(newCoins);
      if (response.success && user) {
        const updatedUser = { ...user, coins: newCoins };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Failed to update coins:', error);
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

  // Show loading screen during initialization
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollToTop currentPage={currentPage} />
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
          onRegistrationSuccess={handleRegistrationSuccess}
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
