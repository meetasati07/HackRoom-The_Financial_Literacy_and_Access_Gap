import { Moon, Sun, Menu, X, Coins, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import LanguageSelector from './LanguageSelector';
import { Language, translations } from '../utils/translations';

interface NavigationProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  user: { name: string; coins: number; level: string } | null;
  onLogout: () => void;
  onGetStarted: () => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export default function Navigation({
  darkMode,
  toggleDarkMode,
  currentPage,
  setCurrentPage,
  user,
  onLogout,
  onGetStarted,
  language,
  onLanguageChange,
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[language];

  const navItems = [
    { id: 'home', label: t.home },
    { id: 'features', label: t.features },
    { id: 'dashboard', label: t.dashboard },
    { id: 'money', label: 'Money Manager' },
    { id: 'games', label: t.games },
    { id: 'about', label: t.about },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FinLearn
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language Selector */}
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={onLanguageChange}
            />

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-foreground" />
              )}
            </button>

            {/* User Section or Get Started */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                    {user.coins}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.level}</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="text-muted-foreground hover:text-foreground"
                  title={t.logout}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {t.getStarted}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LanguageSelector
                  currentLanguage={language}
                  onLanguageChange={onLanguageChange}
                />
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-foreground" />
                  ) : (
                    <Moon className="w-5 h-5 text-foreground" />
                  )}
                </button>
              </div>

              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1.5 rounded-lg">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                      {user.coins}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onLogout} title={t.logout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    onGetStarted();
                    setMobileMenuOpen(false);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  {t.getStarted}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
