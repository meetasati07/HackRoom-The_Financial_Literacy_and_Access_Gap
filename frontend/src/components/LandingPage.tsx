import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { ArrowRight, TrendingUp, Target, Gamepad2, PiggyBank, Shield, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Language, translations } from '../utils/translations';
import { statisticsService, AppStatistics } from '../services/statistics';

interface LandingPageProps {
  onGetStarted: () => void;
  isLoggedIn: boolean;
  language: Language;
}

export default function LandingPage({ onGetStarted, isLoggedIn, language }: LandingPageProps) {
  const t = translations[language];
  const [stats, setStats] = useState<AppStatistics | null>(null);

  useEffect(() => {
    // Calculate dynamic statistics
    const loadStats = async () => {
      try {
        const dynamicStats = await statisticsService.calculateStatistics();
        setStats(dynamicStats);
      } catch (error) {
        console.error('Failed to load statistics:', error);
        // Fallback to default stats
        const fallbackStats = await statisticsService.calculateStatistics();
        setStats(fallbackStats);
      }
    };
    
    loadStats();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800/20 [mask-image:linear-gradient(0deg,transparent,black)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {t.trustedBy}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl mb-6">
                {t.heroTitle1}
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t.heroTitle2}
                </span>
                <br />
                {t.heroTitle3}
              </h1>

              <p className="text-xl text-muted-foreground mb-8">
                {t.heroSubtitle}
              </p>

              {!isLoggedIn && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={onGetStarted}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-14 px-8"
                  >
                    {t.getStarted}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button variant="outline" className="h-14 px-8">
                    {t.watchDemo}
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-3 gap-6 mt-12">
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    {stats?.activeUsersFormatted || '1.2K+'}
                  </div>
                  <div className="text-sm text-muted-foreground">{t.activeUsers}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">
                    {stats?.totalSavingsFormatted || '₹50L+'}
                  </div>
                  <div className="text-sm text-muted-foreground">{t.moneySaved}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-pink-600">
                    {stats?.userRating || '4.8'}★
                  </div>
                  <div className="text-sm text-muted-foreground">{t.userRating}</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* AI Finance Image */}
              <div className="relative z-10">
                <motion.div
                  animate={{ 
                    y: [0, -15, 0],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative rounded-3xl overflow-hidden shadow-2xl"
                >
                  <ImageWithFallback
                    src="https://t4.ftcdn.net/jpg/14/55/59/57/240_F_1455595786_0LGdiECfpoe8iOZxLjkUaZtlqSnwwQ2c.jpg"
                    alt="AI-Powered Financial Intelligence"
                    className="w-full h-auto object-cover rounded-3xl"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/30 via-transparent to-transparent" />
                  
                  {/* Glowing Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                </motion.div>
              </div>

              {/* Floating Stats Cards - Responsive positioning */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute left-0 sm:left-2 md:-left-4 lg:-left-6 top-1/4 z-20 hidden sm:block"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-3 sm:p-4 border border-border min-w-[140px] sm:min-w-[160px]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Savings</span>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-green-600">
                    +{stats ? Math.min(Math.round((stats.moneySaved / 10000000) * 100), 99) : 23}.5%
                  </div>
                  <div className="text-xs text-muted-foreground">This month</div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute right-0 sm:right-2 md:-right-4 lg:-right-6 bottom-1/4 z-20 hidden sm:block"
              >
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-3 sm:p-4 border border-border min-w-[140px] sm:min-w-[160px]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Goals</span>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-purple-600">
                    {stats ? Math.min(Math.floor(stats.activeUsers / 500), 5) : 3}/5
                  </div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </motion.div>
              </motion.div>

              {/* Floating Icon Badges - Responsive positioning */}
              <motion.div
                animate={{ 
                  y: [0, -12, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 md:-top-6 md:-right-6 bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-3 sm:p-4 rounded-xl shadow-lg z-20"
              >
                <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.div>

              <motion.div
                animate={{ 
                  y: [0, 12, 0],
                  rotate: [0, -5, 5, 0],
                }}
                transition={{ duration: 2.8, repeat: Infinity, delay: 0.3 }}
                className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 md:-bottom-6 md:-left-6 bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-3 sm:p-4 rounded-xl shadow-lg z-20"
              >
                <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.div>

              {/* Ambient Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl -z-10 scale-110" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">{t.whyChoose}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t.everythingYouNeed}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800"
            >
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                <Gamepad2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl mb-3">Gamified Learning</h3>
              <p className="text-muted-foreground">
                Learn financial concepts through fun games, challenges, and interactive simulations. Earn coins and badges!
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-800"
            >
              <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl mb-3">Smart Tracking</h3>
              <p className="text-muted-foreground">
                Auto-track expenses via UPI, get personalized insights, and see exactly where your money goes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-8 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-2xl border border-green-200 dark:border-green-800"
            >
              <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl mb-3">Safe & Secure</h3>
              <p className="text-muted-foreground">
                Bank-level encryption, secure data storage, and privacy-first design. Your money stays safe.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl mb-4">
                Ready to Transform Your Financial Future?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of young adults who are already saving smarter and investing safer.
              </p>
              <Button
                onClick={onGetStarted}
                className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-8"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}
