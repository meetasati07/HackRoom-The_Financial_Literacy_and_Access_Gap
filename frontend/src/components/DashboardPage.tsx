import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Target,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Flame,
  Trophy,
  Zap,
  Star,
  Calendar,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle,
  TrendingUpIcon,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Language, translations } from '../utils/translations';
import SetGoalModal from './SetGoalModal';

interface DashboardPageProps {
  user: { name: string; coins: number; level: string } | null;
  language: Language;
  onNavigateToMoneyManager?: (tab: string) => void;
  onCoinsUpdate?: (coins: number) => void;
}

const expenseData = [
  { month: 'Jan', income: 45000, expense: 32000 },
  { month: 'Feb', income: 48000, expense: 35000 },
  { month: 'Mar', income: 47000, expense: 38000 },
  { month: 'Apr', income: 50000, expense: 34000 },
  { month: 'May', income: 52000, expense: 36000 },
  { month: 'Jun', income: 51000, expense: 33000 },
];

const categoryData = [
  { name: 'Food & Dining', value: 12000, color: '#3b82f6' },
  { name: 'Transport', value: 5000, color: '#8b5cf6' },
  { name: 'Entertainment', value: 4000, color: '#ec4899' },
  { name: 'Shopping', value: 8000, color: '#f59e0b' },
  { name: 'Bills', value: 6000, color: '#10b981' },
  { name: 'Others', value: 3000, color: '#6b7280' },
];

const savingsGoals = [
  { name: 'Emergency Fund', current: 45000, target: 100000, color: 'green' },
  { name: 'Vacation', current: 15000, target: 50000, color: 'blue' },
  { name: 'New Laptop', current: 35000, target: 80000, color: 'purple' },
];

const dailyTips = [
  {
    icon: Lightbulb,
    title: 'Save First, Spend Later',
    description: 'Set up automatic transfers to savings on payday. Pay yourself first!',
    color: 'yellow',
  },
  {
    icon: Target,
    title: 'Track Your Goals',
    description: 'Break big financial goals into smaller monthly targets for better success.',
    color: 'blue',
  },
  {
    icon: Sparkles,
    title: 'Invest Wisely',
    description: 'Start a SIP with even ₹500/month. Small amounts compound over time!',
    color: 'purple',
  },
];

const quickActions = [
  { icon: Zap, label: 'Add Expense', color: 'bg-blue-500' },
  { icon: TrendingUp, label: 'View Analytics', color: 'bg-green-500' },
  { icon: Target, label: 'Set Goal', color: 'bg-purple-500' },
];

const recentActivities = [
  { type: 'expense', title: 'Coffee Shop', amount: '₹250', time: '2 hours ago', icon: CreditCard },
  { type: 'income', title: 'Salary Credited', amount: '₹51,000', time: 'Today', icon: DollarSign },
  { type: 'achievement', title: 'Earned "Saver" Badge', amount: '+100 coins', time: 'Yesterday', icon: Trophy },
];

export default function DashboardPage({ user, language, onNavigateToMoneyManager, onCoinsUpdate }: DashboardPageProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [streak, setStreak] = useState(1);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(50000);
  const [categories, setCategories] = useState<any[]>([]);
  const t = translations[language];

  // Load data from localStorage on component mount
  useEffect(() => {
    // Load monthly income
    const savedIncome = localStorage.getItem('monthlyIncome');
    if (savedIncome) {
      setMonthlyIncome(parseInt(savedIncome));
    }

    // Load categories from money management
    const savedCategories = localStorage.getItem('moneyCategories');
    if (savedCategories) {
      const parsedCategories = JSON.parse(savedCategories);
      setCategories(parsedCategories);
    }

    // Calculate streak based on user activity
    const lastActivityDate = localStorage.getItem('lastActivityDate');
    const today = new Date().toDateString();
    
    if (lastActivityDate === today) {
      // User has been active today, maintain or increase streak
      const currentStreak = parseInt(localStorage.getItem('userStreak') || '1');
      setStreak(currentStreak);
    } else {
      // Reset streak and update activity date
      setStreak(1);
      localStorage.setItem('userStreak', '1');
      localStorage.setItem('lastActivityDate', today);
    }
  }, []);

  // Calculate dynamic values based on real data
  const totalExpense = categories.reduce((sum, cat) => sum + (cat.spent || 0), 0);
  const totalIncome = monthlyIncome;
  const totalSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : '0';

  // Create dynamic category data for charts
  const dynamicCategoryData = categories.length > 0 ? categories.map(cat => ({
    name: cat.name,
    value: cat.spent || 0,
    color: cat.color || '#6b7280'
  })).filter(cat => cat.value > 0) : categoryData;

  // Create dynamic expense data based on current spending
  const dynamicExpenseData = [
    { month: 'Jan', income: monthlyIncome * 0.9, expense: totalExpense * 0.7 },
    { month: 'Feb', income: monthlyIncome * 0.95, expense: totalExpense * 0.8 },
    { month: 'Mar', income: monthlyIncome * 0.92, expense: totalExpense * 0.85 },
    { month: 'Apr', income: monthlyIncome * 0.98, expense: totalExpense * 0.9 },
    { month: 'May', income: monthlyIncome * 1.02, expense: totalExpense * 0.95 },
    { month: 'Jun', income: monthlyIncome, expense: totalExpense },
  ];

  // Create dynamic recent activities based on actual data
  const dynamicRecentActivities = [
    {
      type: 'income',
      title: 'Monthly Income',
      amount: `₹${monthlyIncome.toLocaleString()}`,
      time: 'This month',
      icon: DollarSign
    },
    ...categories.slice(0, 2).map(cat => ({
      type: 'expense' as const,
      title: cat.name || 'Expense',
      amount: `₹${(cat.spent || 0).toLocaleString()}`,
      time: 'Recent',
      icon: CreditCard
    })),
    {
      type: 'achievement',
      title: 'Financial Tracking',
      amount: `+${Math.min(user?.coins || 0, 500)} coins`,
      time: 'Today',
      icon: Trophy
    }
  ];

  // Calculate dynamic financial journey metrics
  const financialKnowledge = Math.min(85 + (categories.length * 2), 100);
  const savingsPercentage = Math.min(parseFloat(savingsRate), 100);
  const investmentSkills = Math.min(60 + (totalSavings > 0 ? 20 : 0) + (categories.length > 5 ? 15 : 0), 100);

  // Dynamic achievements based on user behavior
  const dynamicAchievements = [
    {
      icon: Trophy,
      color: 'yellow',
      label: `${categories.filter(cat => cat.spent > 0).length} Categories`,
      delay: 1.5
    },
    {
      icon: Target,
      color: 'blue',
      label: `${savingsGoals.length} Goals`,
      delay: 1.7
    },
    {
      icon: Star,
      color: 'purple',
      label: `${streak} Day Streak`,
      delay: 1.9
    }
  ];

  const currentTip = dailyTips[currentTipIndex];

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % dailyTips.length);
  };

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + dailyTips.length) % dailyTips.length);
  };

  const handleQuickAction = (label: string) => {
    if (label === 'Add Expense' && onNavigateToMoneyManager) {
      onNavigateToMoneyManager('categories');
    } else if (label === 'View Analytics' && onNavigateToMoneyManager) {
      onNavigateToMoneyManager('dashboard');
    } else if (label === 'Set Goal') {
      setShowGoalModal(true);
    }
  };

  return (
    <div className="min-h-screen py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header with Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl mb-2">
                {t.welcomeBackUser}, {user?.name || 'User'}! 👋
              </h1>
              <p className="text-muted-foreground">
                {t.financialOverview}
              </p>
            </div>
            
            {/* Streak Counter */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl shadow-lg"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Flame className="w-6 h-6" />
              </motion.div>
              <div>
                <div className="text-2xl font-bold">{streak} {language === 'en' ? 'Days' : language === 'hi' ? 'दिन' : 'दिवस'}</div>
                <div className="text-xs opacity-90">{t.activeDays} 🔥</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Financial Growth Banner with Animated Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <Card className="overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-2 border-blue-200 dark:border-blue-800">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                {/* Left: Animated Image */}
                <div className="relative overflow-hidden p-6">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="relative"
                  >
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 2, 0, -2, 0],
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="relative rounded-2xl overflow-hidden shadow-2xl"
                    >
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjBjaGFydHMlMjBncmFwaHN8ZW58MXx8fHwxNzU5NDU1MjUxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="Financial Analytics"
                        className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/40 to-transparent" />
                    </motion.div>
                    
                    {/* Floating Icons - Responsive sizes */}
                    <motion.div
                      animate={{ 
                        y: [0, -15, 0],
                        x: [0, 5, 0],
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 md:-top-4 md:-right-4 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                    </motion.div>
                    
                    <motion.div
                      animate={{ 
                        y: [0, 15, 0],
                        x: [0, -5, 0],
                      }}
                      transition={{ 
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5,
                      }}
                      className="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3 md:-bottom-4 md:-left-4 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-purple-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Target className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Right: Daily Tip Carousel */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold">{t.dailyTip}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevTip}
                        className="p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 rotate-180" />
                      </button>
                      <button
                        onClick={nextTip}
                        className="p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentTipIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-4"
                    >
                      <motion.div
                        animate={{ 
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1,
                        }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          currentTip.color === 'yellow' ? 'bg-yellow-500' :
                          currentTip.color === 'blue' ? 'bg-blue-500' :
                          'bg-purple-500'
                        }`}
                      >
                        <currentTip.icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-2">{currentTip.title}</h4>
                        <p className="text-sm text-muted-foreground">{currentTip.description}</p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  
                  <div className="flex items-center justify-center gap-2 mt-4">
                    {dailyTips.map((_, index) => (
                      <motion.div
                        key={index}
                        animate={{
                          scale: currentTipIndex === index ? 1.2 : 1,
                          opacity: currentTipIndex === index ? 1 : 0.5,
                        }}
                        className={`w-2 h-2 rounded-full ${
                          currentTipIndex === index ? 'bg-purple-600' : 'bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions - Floating Interactive Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <h3 className="text-lg font-semibold mb-4">{t.quickActions}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                onClick={() => handleQuickAction(action.label)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <Card className="overflow-hidden border-2 border-transparent hover:border-primary transition-all cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center gap-3">
                    <motion.div
                      className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <action.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <span className="text-sm font-medium text-center">{action.label}</span>
                  </CardContent>
                </Card>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg -z-10 blur-xl"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">{t.totalIncome}</CardTitle>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalIncome.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  +8% from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -5 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -mr-10 -mt-10" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">{t.totalExpenses}</CardTitle>
                <CreditCard className="w-4 h-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalExpense.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-green-600" />
                  -3% from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ y: -5 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">{t.totalSavings}</CardTitle>
                <DollarSign className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalSavings.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{savingsRate}% savings rate</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ y: -5 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">{t.activeGoals}</CardTitle>
                <Target className="w-4 h-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{savingsGoals.length}</div>
                <p className="text-xs text-muted-foreground">2 on track</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity - Creative Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-10"
        >
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Recent Activity Card */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">{t.recentActivity}</h3>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {dynamicRecentActivities.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors group cursor-pointer"
                      >
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'expense' ? 'bg-red-100 dark:bg-red-950/30' :
                            activity.type === 'income' ? 'bg-green-100 dark:bg-green-950/30' :
                            'bg-yellow-100 dark:bg-yellow-950/30'
                          }`}
                        >
                          <activity.icon className={`w-5 h-5 ${
                            activity.type === 'expense' ? 'text-red-600' :
                            activity.type === 'income' ? 'text-green-600' :
                            'text-yellow-600'
                          }`} />
                        </motion.div>
                        <div className="flex-1">
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {activity.time}
                          </div>
                        </div>
                        <div className={`font-semibold ${
                          activity.type === 'expense' ? 'text-red-600' :
                          activity.type === 'income' ? 'text-green-600' :
                          'text-yellow-600'
                        }`}>
                          {activity.amount}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Animated Growth Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Financial Journey 📈</h3>
              <Card className="overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-pink-950/20">
                <CardContent className="p-6">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="relative"
                  >
                    {/* Animated Growth Bars */}
                    <div className="space-y-4 mb-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Financial Knowledge</span>
                          <span className="text-sm font-bold text-blue-600">{financialKnowledge}%</span>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${financialKnowledge}%` }}
                            transition={{ duration: 1.5, delay: 0.9 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Savings Discipline</span>
                          <span className="text-sm font-bold text-green-600">{Math.round(savingsPercentage)}%</span>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round(savingsPercentage)}%` }}
                            transition={{ duration: 1.5, delay: 1.1 }}
                            className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Investment Skills</span>
                          <span className="text-sm font-bold text-purple-600">{Math.round(investmentSkills)}%</span>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round(investmentSkills)}%` }}
                            transition={{ duration: 1.5, delay: 1.3 }}
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Animated Achievement Icons */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { icon: Trophy, color: 'yellow', label: '5 Games', delay: 1.5 },
                        { icon: Target, color: 'blue', label: '3 Goals', delay: 1.7 },
                        { icon: Star, color: 'purple', label: '12 Badges', delay: 1.9 },
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            type: 'spring',
                            duration: 0.8,
                            delay: item.delay,
                          }}
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          className={`p-4 rounded-xl text-center ${
                            item.color === 'yellow'
                              ? 'bg-yellow-100 dark:bg-yellow-950/30'
                              : item.color === 'blue'
                              ? 'bg-blue-100 dark:bg-blue-950/30'
                              : 'bg-purple-100 dark:bg-purple-950/30'
                          }`}
                        >
                          <motion.div
                            animate={{
                              y: [0, -5, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.3,
                            }}
                          >
                            <item.icon
                              className={`w-8 h-8 mx-auto mb-1 ${
                                item.color === 'yellow'
                                  ? 'text-yellow-600'
                                  : item.color === 'blue'
                                  ? 'text-blue-600'
                                  : 'text-purple-600'
                              }`}
                            />
                          </motion.div>
                          <div className="text-xs font-semibold">{item.label}</div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Motivational Text */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.1 }}
                      className="mt-6 p-4 bg-white/50 dark:bg-black/20 rounded-lg text-center"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        🎯 You're on track to financial success!
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Keep learning and growing your wealth
                      </p>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Smart Insights Alert */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-10"
          >
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800 overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-3 gap-0">
                  {/* Animated Money Image */}
                  <div className="relative overflow-hidden">
                    <motion.div
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.9 }}
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.08, 1],
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <ImageWithFallback
                          src="https://images.unsplash.com/photo-1604594849809-dfedbc827105?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb25leSUyMHNhdmluZ3MlMjBpbnZlc3RtZW50fGVufDF8fHx8MTc1OTQ4Njk0MHww&ixlib=rb-4.1.0&q=80&w=1080"
                          alt="Smart Savings"
                          className="w-full h-full object-cover min-h-[200px]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/30 to-transparent" />
                      </motion.div>
                      
                      {/* Floating Dollar Sign */}
                      <motion.div
                        animate={{ 
                          y: [0, -10, 0],
                          rotate: [0, 360],
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center shadow-2xl"
                      >
                        <DollarSign className="w-8 h-8 text-white" />
                      </motion.div>
                    </motion.div>
                  </div>
                  
                  {/* Content */}
                  <div className="md:col-span-2 p-6 flex items-start gap-4">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0"
                    >
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Smart Spending Alert</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        You spent ₹4,000 on food delivery this month. If you saved this ₹4,000 and invested it in a SIP with 12% annual returns, you could grow <strong>₹4,764</strong> in 1 year!
                      </p>
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                          Try cooking at home 2-3 times a week to save ₹1,500/month
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Income vs Expense Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.02 }}
            className="transition-all"
          >
            <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 border-2 hover:border-primary/20">
              <CardHeader className="bg-gradient-to-r from-green-50 via-emerald-50 to-blue-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-blue-950/20">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Income vs Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={dynamicExpenseData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickFormatter={(value) => `₹${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '2px solid hsl(var(--primary))',
                        borderRadius: '12px',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                      formatter={(value: any) => [`₹${value.toLocaleString()}`, '']}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorIncome)"
                      animationDuration={1500}
                      name="Income"
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke="#ef4444"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorExpense)"
                      animationDuration={1500}
                      name="Expenses"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Breakdown - Professional Donut Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="transition-all"
          >
            <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/30 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-purple-950/10 dark:to-pink-950/10">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border-b">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                    <PieChartIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Expense by Category
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 pb-6">
                {/* Interactive Donut Chart */}
                <div className="relative">
                  <ResponsiveContainer width="100%" height={340}>
                    <PieChart>
                      <Pie
                        data={dynamicCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        outerRadius={110}
                        innerRadius={75}
                        fill="#8884d8"
                        dataKey="value"
                        animationDuration={1500}
                        animationBegin={0}
                        activeIndex={activeIndex}
                        activeShape={{
                          outerRadius: 120,
                          innerRadius: 70,
                        }}
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(undefined)}
                      >
                        {dynamicCategoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke="#fff"
                            strokeWidth={3}
                            style={{
                              filter: activeIndex === index 
                                ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' 
                                : 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              cursor: 'pointer',
                            }}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Center Display */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <AnimatePresence mode="wait">
                      {activeIndex !== undefined ? (
                        <motion.div
                          key={`active-${activeIndex}`}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-center"
                        >
                          <div 
                            className="w-3 h-3 rounded-full mx-auto mb-2"
                            style={{ backgroundColor: dynamicCategoryData[activeIndex].color }}
                          />
                          <div className="text-xs text-muted-foreground font-medium mb-1">
                            {dynamicCategoryData[activeIndex].name}
                          </div>
                          <div className="text-2xl font-bold" style={{ color: dynamicCategoryData[activeIndex].color }}>
                            ₹{dynamicCategoryData[activeIndex].value.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {((dynamicCategoryData[activeIndex].value / totalExpense) * 100).toFixed(1)}%
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="default"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-center"
                        >
                          <div className="text-xs text-muted-foreground font-medium mb-1">
                            Total Expenses
                          </div>
                          <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            ₹{totalExpense.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            This Month
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Category Legend with Progress Bars */}
                <div className="mt-8 space-y-3">
                  {dynamicCategoryData.map((category, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + index * 0.08 }}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(undefined)}
                      className={`group relative p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                        activeIndex === index 
                          ? 'bg-accent shadow-md scale-[1.02]' 
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{ 
                              scale: activeIndex === index ? 1.3 : 1,
                              rotate: activeIndex === index ? 180 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            className="w-3 h-3 rounded-full shadow-lg"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm font-semibold">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {((category.value / totalExpense) * 100).toFixed(0)}%
                          </span>
                          <span className="text-sm font-bold">
                            ₹{(category.value / 1000).toFixed(1)}k
                          </span>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(category.value / totalExpense) * 100}%` }}
                          transition={{ duration: 1, delay: 1.3 + index * 0.08 }}
                          className="h-full rounded-full"
                          style={{ 
                            backgroundColor: category.color,
                            boxShadow: activeIndex === index ? `0 0 8px ${category.color}` : 'none',
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Savings Goals with Creative Progress Rings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg md:text-xl font-semibold">{t.savingsGoals}</h3>
            
            {/* Animated Savings Image Badge - Hidden on small mobile, shown on larger screens */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8, delay: 1.2 }}
              className="relative hidden xs:block"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-3 md:border-4 border-yellow-400 shadow-xl"
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1622219999459-ab5b14e5f45a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaWdneSUyMGJhbmslMjBjb2luc3xlbnwxfHx8fDE3NTkzOTY5NDV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Savings"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              
              {/* Floating Coins */}
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, 360],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <span className="text-white text-[10px] sm:text-xs font-bold">₹</span>
              </motion.div>
            </motion.div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {savingsGoals.map((goal, index) => {
              const percentage = (goal.current / goal.target) * 100;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full ${
                      goal.color === 'green' ? 'bg-green-500/10' :
                      goal.color === 'blue' ? 'bg-blue-500/10' :
                      'bg-purple-500/10'
                    }`} />
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">{goal.name}</h4>
                        <Badge variant="outline" className={
                          goal.color === 'green' ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400' :
                          goal.color === 'blue' ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400' :
                          'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400'
                        }>
                          {percentage.toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Progress value={percentage} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            ₹{goal.current.toLocaleString()}
                          </span>
                          <span className="font-medium">
                            ₹{goal.target.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ₹{(goal.target - goal.current).toLocaleString()} remaining
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Set Goal Modal */}
      <SetGoalModal
        open={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        user={user}
        onCoinsUpdate={onCoinsUpdate}
      />
    </div>
  );
}