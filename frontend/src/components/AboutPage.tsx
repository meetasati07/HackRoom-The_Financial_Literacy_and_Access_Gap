import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Target, Users, Heart, Shield, Zap, TrendingUp } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Language, translations } from '../utils/translations';
import { statisticsService, AppStatistics } from '../services/statistics';

interface AboutPageProps {
  language: Language;
}

export default function AboutPage({ language }: AboutPageProps) {
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

  const values = [
    {
      icon: Target,
      title: 'Financial Literacy',
      description: 'We believe everyone deserves access to quality financial education, regardless of their background.',
    },
    {
      icon: Heart,
      title: 'Youth Empowerment',
      description: 'Helping young adults build a strong financial foundation for a secure and prosperous future.',
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Your financial data and privacy are our top priorities. Bank-level encryption keeps you safe.',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Combining gamification with AI to make financial learning engaging, fun, and effective.',
    },
  ];

  const team = [
    { name: 'Sudhanva Kulkarni', avatar: 'SK' },
    { name: 'Prathamesh Selmokar', avatar: 'PS' },
    { name: 'Prathmesh Nirmal', avatar: 'PN' },
    { name: 'Meet Asati', avatar: 'MA' },
    { name: 'Shivam Devkar', avatar: 'SD' },
    { name: 'Shridhar Panigrahi', avatar: 'SP' },
  ];

  return (
    <div className="min-h-screen py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-5xl mb-6">
            Our Mission:{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Financial Freedom for All
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empowering young adults with financial literacy, safe investing habits, and smart money management through innovative technology and gamified learning.
          </p>
        </motion.div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-16 mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative h-[400px] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950/20 dark:to-purple-950/20 flex items-center justify-center">
              <div className="text-center p-8">
                <TrendingUp className="w-24 h-24 mx-auto mb-4 text-blue-600" />
                <h3 className="text-2xl font-semibold mb-2">Growing Together</h3>
                <p className="text-muted-foreground">
                  {stats?.activeUsersFormatted || '1.2K+'} users learning and saving smarter every day
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col justify-center"
          >
            <h2 className="text-3xl mb-4">Our Story</h2>
            <p className="text-muted-foreground mb-4">
              FinLearn was born from a simple observation: traditional financial education is boring, inaccessible, and often too late. We saw young adults struggling with debt, missing investment opportunities, and making costly financial mistakes.
            </p>
            <p className="text-muted-foreground mb-4">
              We believed there had to be a better way. By combining gamification, AI-powered insights, and real-time expense tracking, we created a platform that makes financial learning as engaging as your favorite mobile game.
            </p>
            <p className="text-muted-foreground">
              Today, we're proud to help thousands of young adults take control of their financial future, one coin at a time.
            </p>
          </motion.div>
        </div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-24"
        >
          <h2 className="text-3xl text-center mb-16">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-24"
        >
          <h2 className="text-3xl text-center mb-16">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                  {member.avatar}
                </div>
                <h3 className="text-base font-semibold">{member.name}</h3>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-12"
        >
          <h2 className="text-3xl text-center mb-12">Our Impact</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats?.activeUsersFormatted || '1.2K+'}
              </div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {stats?.totalSavingsFormatted || '₹50L+'}
              </div>
              <div className="text-muted-foreground">Money Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-600 mb-2">
                {stats?.gamesCompletedFormatted || '8.5K+'}
              </div>
              <div className="text-muted-foreground">Games Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {stats?.userRating || '4.8'}★
              </div>
              <div className="text-muted-foreground">User Rating</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
