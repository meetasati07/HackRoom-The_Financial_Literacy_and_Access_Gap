import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, TrendingUp, AlertTriangle, CheckCircle, PieChart as PieChartIcon, 
  BarChart3, Lightbulb, Shield, Lock, Unlock, Bell, Target, 
  Calendar, ArrowUpRight, ArrowDownRight, Sparkles, DollarSign,
  ShoppingBag, Utensils, Plane, Zap, Heart, Home, MoreHorizontal,
  TrendingDown, Award, Coins as CoinsIcon, Plus, Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { toast } from 'sonner@2.0.3';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Language, translations } from '../utils/translations';
import AddExpenseModal from './AddExpenseModal';
import SentimentAnalysisModal from './SentimentAnalysisModal';
import WhatIfSimulator from './WhatIfSimulator';

interface MoneyManagementPageProps {
  user: { name: string; coins: number; level: string } | null;
  language: Language;
  onCoinsUpdate?: (coins: number) => void;
  initialTab?: string;
}

interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
  spent: number;
  limit: number;
  percentage: number;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: string;
  priority: 'high' | 'medium' | 'low';
  color: string;
}

const initialCategories: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: Utensils, color: '#10b981', spent: 8500, limit: 12000, percentage: 71 },
  { id: 'entertainment', name: 'Entertainment', icon: Sparkles, color: '#8b5cf6', spent: 3200, limit: 5000, percentage: 64 },
  { id: 'travel', name: 'Travel', icon: Plane, color: '#3b82f6', spent: 4500, limit: 6000, percentage: 75 },
  { id: 'shopping', name: 'Shopping', icon: ShoppingBag, color: '#ec4899', spent: 9800, limit: 8000, percentage: 122 },
  { id: 'savings', name: 'Savings & Investment', icon: TrendingUp, color: '#059669', spent: 5000, limit: 10000, percentage: 50 },
  { id: 'insurance', name: 'Insurance', icon: Shield, color: '#0ea5e9', spent: 2000, limit: 3000, percentage: 67 },
  { id: 'emergency', name: 'Emergency Fund', icon: Heart, color: '#ef4444', spent: 1500, limit: 5000, percentage: 30 },
  { id: 'misc', name: 'Miscellaneous', icon: MoreHorizontal, color: '#f59e0b', spent: 2300, limit: 4000, percentage: 58 },
];

const weeklyTrends = [
  { week: 'Week 1', spending: 8500, limit: 10000 },
  { week: 'Week 2', spending: 9200, limit: 10000 },
  { week: 'Week 3', spending: 11200, limit: 10000 },
  { week: 'Week 4', spending: 8100, limit: 10000 },
];

export default function MoneyManagementPage({ user, language, onCoinsUpdate, initialTab = 'categories' }: MoneyManagementPageProps) {
  const [monthlyIncome, setMonthlyIncome] = useState(50000);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [upiConnected, setUpiConnected] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showIncomeInput, setShowIncomeInput] = useState(false);
  const [tempIncome, setTempIncome] = useState('50000');
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showSentimentModal, setShowSentimentModal] = useState(false);
  const t = translations[language];

  // Load categories from localStorage on mount
  useEffect(() => {
    const savedCategories = localStorage.getItem('moneyCategories');
    if (savedCategories) {
      const parsedCategories = JSON.parse(savedCategories);
      // Merge saved data with initial categories to preserve icon components
      const mergedCategories = initialCategories.map(initCat => {
        const savedCat = parsedCategories.find((c: any) => c.id === initCat.id);
        if (savedCat) {
          return {
            ...initCat,
            spent: savedCat.spent,
            limit: savedCat.limit,
            percentage: savedCat.percentage,
          };
        }
        return initCat;
      });
      setCategories(mergedCategories);
    }
  }, []);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    // Save only the data, not the icon components
    const categoriesToSave = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      spent: cat.spent,
      limit: cat.limit,
      percentage: cat.percentage,
    }));
    localStorage.setItem('moneyCategories', JSON.stringify(categoriesToSave));
    
    // Update weekly goals with total spending
    const totalWeeklySpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
    localStorage.setItem('weeklyTotalSpent', totalWeeklySpent.toString());
  }, [categories]);

  // Update active tab when initialTab prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalLimit = categories.reduce((sum, cat) => sum + cat.limit, 0);
  const remainingMoney = monthlyIncome - totalSpent;
  const spendingPercentage = (totalSpent / monthlyIncome) * 100;

  const overSpentCategories = categories.filter(cat => cat.percentage > 100);
  const underSpentCategories = categories.filter(cat => cat.percentage < 50);

  const suggestions: Suggestion[] = [
    {
      id: '1',
      title: 'Boost Emergency Fund',
      description: `Add ₹${Math.floor(remainingMoney * 0.3).toLocaleString()} to your emergency savings`,
      icon: Heart,
      action: 'Add to Fund',
      priority: 'high',
      color: 'from-red-500 to-rose-600'
    },
    {
      id: '2',
      title: 'Start SIP Investment',
      description: 'Invest ₹5,000/month in mutual funds for long-term growth',
      icon: TrendingUp,
      action: 'Start SIP',
      priority: 'high',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: '3',
      title: 'Health Insurance',
      description: 'Secure your future with comprehensive health coverage',
      icon: Shield,
      action: 'Get Insured',
      priority: 'medium',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: '4',
      title: 'Optimize Shopping',
      description: 'You overspent by ₹1,800. Reduce non-essential purchases',
      icon: ShoppingBag,
      action: 'View Tips',
      priority: 'medium',
      color: 'from-pink-500 to-rose-600'
    },
  ];

  const handleIncomeUpdate = () => {
    const newIncome = parseInt(tempIncome);
    if (newIncome > 0) {
      setMonthlyIncome(newIncome);
      setShowIncomeInput(false);
      toast.success(`Income updated to ₹${newIncome.toLocaleString()}`);
      
      // Award coins for updating income
      if (user && onCoinsUpdate) {
        onCoinsUpdate(user.coins + 10);
        toast.success('🪙 Earned 10 coins for updating income!');
      }
    }
  };

  const handleCategoryLimitUpdate = (categoryId: string, newLimit: number) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, limit: newLimit, percentage: Math.round((cat.spent / newLimit) * 100) }
        : cat
    ));
    toast.success('Limit updated successfully');
  };

  const handleConnectUPI = () => {
    setUpiConnected(!upiConnected);
    if (!upiConnected) {
      toast.success('🎉 UPI connected successfully!');
      if (user && onCoinsUpdate) {
        onCoinsUpdate(user.coins + 50);
        toast.success('🪙 Earned 50 coins for connecting UPI!');
      }
    } else {
      toast.info('UPI disconnected');
    }
  };

  const handleSuggestionAction = (suggestion: Suggestion) => {
    toast.success(`${suggestion.action} initiated!`);
    if (user && onCoinsUpdate) {
      onCoinsUpdate(user.coins + 20);
      toast.success('🪙 Earned 20 coins for taking action!');
    }
  };

  const handleOpenAddExpense = (category: Category) => {
    setSelectedCategory(category);
    setShowAddExpenseModal(true);
  };

  const handleAddExpense = (categoryId: string, amount: number, description: string) => {
    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        const newSpent = cat.spent + amount;
        const newPercentage = Math.round((newSpent / cat.limit) * 100);
        
        // Check if crossed limit
        const wasUnderLimit = cat.percentage <= 100;
        const isOverLimit = newPercentage > 100;
        
        if (wasUnderLimit && isOverLimit && notificationsEnabled) {
          toast.error(`⚠️ You've exceeded your ${cat.name} limit!`, {
            duration: 5000,
          });
        }
        
        return {
          ...cat,
          spent: newSpent,
          percentage: newPercentage
        };
      }
      return cat;
    });

    setCategories(updatedCategories);
    
    toast.success(`Added ₹${amount} to ${selectedCategory?.name}`, {
      description: description,
      duration: 3000,
    });

    // Award coins for tracking expense
    if (user && onCoinsUpdate) {
      onCoinsUpdate(user.coins + 5);
      toast.success('🪙 Earned 5 coins for tracking expense!');
    }
  };

  const handleResetCategories = () => {
    const resetCategories = categories.map(cat => ({
      ...cat,
      spent: 0,
      percentage: 0
    }));
    setCategories(resetCategories);
    localStorage.setItem('moneyCategories', JSON.stringify(resetCategories));
    toast.success('All category expenses have been reset to ₹0');
  };

  return (
    <div className="min-h-screen py-16 md:py-24 bg-gradient-to-b from-background via-blue-50/30 to-background dark:from-background dark:via-blue-950/10 dark:to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl md:text-5xl mb-3">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
              Money Management
            </span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Track expenses, set limits, and get smart suggestions for better financial health
          </p>
        </motion.div>

        {/* Income & Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {/* Monthly Income Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-blue-400/50 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowIncomeInput(!showIncomeInput)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {showIncomeInput ? 'Cancel' : 'Update'}
                  </Button>
                </div>
                {showIncomeInput ? (
                  <div className="space-y-3">
                    <Input
                      type="number"
                      value={tempIncome}
                      onChange={(e) => setTempIncome(e.target.value)}
                      placeholder="Enter income"
                      className="text-lg"
                    />
                    <Button onClick={handleIncomeUpdate} className="w-full">
                      Save Income
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">Monthly Income</div>
                    <div className="text-3xl font-bold text-blue-600">
                      ₹{monthlyIncome.toLocaleString()}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Spent Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className={`border-2 shadow-lg hover:shadow-xl transition-all ${
              spendingPercentage > 90 
                ? 'border-red-400/50 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20'
                : 'border-green-400/50 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    spendingPercentage > 90
                      ? 'bg-gradient-to-br from-red-500 to-orange-600'
                      : 'bg-gradient-to-br from-green-500 to-emerald-600'
                  }`}>
                    <ArrowDownRight className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant={spendingPercentage > 90 ? 'destructive' : 'default'}>
                    {spendingPercentage.toFixed(0)}%
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-1">Total Spent</div>
                <div className={`text-3xl font-bold ${
                  spendingPercentage > 90 ? 'text-red-600' : 'text-green-600'
                }`}>
                  ₹{totalSpent.toLocaleString()}
                </div>
                <Progress value={spendingPercentage} className="mt-3 h-2" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Remaining Money Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 border-purple-400/50 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="outline" className="bg-white/50">
                    Available
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-1">Remaining Balance</div>
                <div className="text-3xl font-bold text-purple-600">
                  ₹{remainingMoney.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {((remainingMoney / monthlyIncome) * 100).toFixed(0)}% of income
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-10">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="advisor">Advisor</TabsTrigger>
            <TabsTrigger value="upi">UPI Connect</TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl mb-2">Spending Categories</h2>
                  <p className="text-muted-foreground">
                    Monitor and control your spending across different categories
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetCategories}
                  className="text-xs"
                >
                  Reset All
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {categories.map((category, index) => {
                  const Icon = category.icon;
                  const isOverLimit = category.percentage > 100;
                  const isWellManaged = category.percentage < 70;

                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      <Card className={`border-2 transition-all hover:shadow-lg ${
                        isOverLimit 
                          ? 'border-red-400/50 bg-red-50/50 dark:bg-red-950/10'
                          : isWellManaged
                          ? 'border-green-400/50 bg-green-50/50 dark:bg-green-950/10'
                          : 'border-border'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ 
                                  background: `linear-gradient(135deg, ${category.color}, ${category.color}dd)`
                                }}
                              >
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{category.name}</h3>
                                <div className="text-sm text-muted-foreground">
                                  ₹{category.spent.toLocaleString()} / ₹{category.limit.toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <Badge 
                              variant={isOverLimit ? 'destructive' : 'outline'}
                              className={isWellManaged ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' : ''}
                            >
                              {category.percentage}%
                            </Badge>
                          </div>

                          <Progress 
                            value={Math.min(category.percentage, 100)} 
                            className={`h-2.5 mb-3 ${
                              isOverLimit ? '[&>div]:bg-red-500' : isWellManaged ? '[&>div]:bg-green-500' : ''
                            }`}
                          />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isOverLimit && (
                                <div className="flex items-center gap-1 text-xs text-red-600">
                                  <AlertTriangle className="w-3 h-3" />
                                  Over limit!
                                </div>
                              )}
                              {isWellManaged && (
                                <div className="flex items-center gap-1 text-xs text-green-600">
                                  <CheckCircle className="w-3 h-3" />
                                  Well managed
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenAddExpense(category)}
                                className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 border-0"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newLimit = prompt(`Set new limit for ${category.name}:`, category.limit.toString());
                                  if (newLimit) handleCategoryLimitUpdate(category.id, parseInt(newLimit));
                                }}
                                className="text-xs"
                              >
                                Set Limit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Notifications Toggle */}
              <Card className="mt-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                        <Bell className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Weekly Limit Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          Get alerts when you exceed category limits
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl mb-2">Expense Dashboard</h2>
                <p className="text-muted-foreground">
                  Visual insights into your spending patterns
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* Pie Chart - Category Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-purple-600" />
                      Spending by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-6">
                    {/* Interactive Donut Chart */}
                    <div className="relative">
                      <ResponsiveContainer width="100%" height={340}>
                        <PieChart>
                          <Pie
                            data={categories}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={false}
                            outerRadius={110}
                            innerRadius={75}
                            fill="#8884d8"
                            dataKey="spent"
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
                            {categories.map((entry, index) => (
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
                                style={{ backgroundColor: categories[activeIndex].color }}
                              />
                              <div className="text-xs text-muted-foreground font-medium mb-1 max-w-[120px]">
                                {categories[activeIndex].name}
                              </div>
                              <div className="text-2xl font-bold" style={{ color: categories[activeIndex].color }}>
                                ₹{categories[activeIndex].spent.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {((categories[activeIndex].spent / totalSpent) * 100).toFixed(1)}%
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
                                Total Spent
                              </div>
                              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                ₹{totalSpent.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                This Month
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Category Legend */}
                    <div className="grid grid-cols-2 gap-2 mt-6">
                      {categories.map((cat, index) => (
                        <motion.div 
                          key={cat.id} 
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                          onMouseEnter={() => setActiveIndex(index)}
                          onMouseLeave={() => setActiveIndex(undefined)}
                        >
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-xs text-muted-foreground truncate">{cat.name}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Bar Chart - Planned vs Actual */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Planned vs Actual Spending
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="w-full overflow-x-auto">
                      <ResponsiveContainer width="100%" height={340} minWidth={300}>
                        <BarChart data={categories.slice(0, 5)} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis 
                            dataKey="name" 
                            angle={-45} 
                            textAnchor="end" 
                            height={80} 
                            tick={{ fontSize: 11 }}
                            interval={0}
                          />
                          <YAxis tick={{ fontSize: 11 }} />
                          <RechartsTooltip 
                            formatter={(value: number) => `₹${value.toLocaleString()}`}
                            contentStyle={{ borderRadius: '8px' }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '10px' }} />
                          <Bar dataKey="limit" fill="#3b82f6" name="Limit" radius={[8, 8, 0, 0]} />
                          <Bar dataKey="spent" fill="#8b5cf6" name="Spent" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Line Chart - Weekly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Weekly Spending Trends
                  </CardTitle>
                  <CardDescription>
                    Track your spending patterns over the month
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="w-full overflow-x-auto">
                    <ResponsiveContainer width="100%" height={300} minWidth={300}>
                      <LineChart data={weeklyTrends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RechartsTooltip 
                          formatter={(value: number) => `₹${value.toLocaleString()}`}
                          contentStyle={{ borderRadius: '8px' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Line 
                          type="monotone" 
                          dataKey="spending" 
                          stroke="#8b5cf6" 
                          strokeWidth={3} 
                          name="Actual Spending"
                          dot={{ r: 5, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 7 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="limit" 
                          stroke="#10b981" 
                          strokeWidth={2} 
                          strokeDasharray="5 5" 
                          name="Weekly Limit"
                          dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Insights */}
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <motion.div 
                      className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-sm text-muted-foreground mb-1">Best Week</div>
                      <div className="text-xl font-bold text-green-600">Week 4</div>
                      <div className="text-xs text-muted-foreground">₹8,100 spent</div>
                    </motion.div>
                    <motion.div 
                      className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-sm text-muted-foreground mb-1">Peak Week</div>
                      <div className="text-xl font-bold text-red-600">Week 3</div>
                      <div className="text-xs text-muted-foreground">₹11,200 spent</div>
                    </motion.div>
                    <motion.div 
                      className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-sm text-muted-foreground mb-1">Average</div>
                      <div className="text-xl font-bold text-blue-600">₹9,250</div>
                      <div className="text-xs text-muted-foreground">per week</div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Smart Advisor Tab */}
          <TabsContent value="advisor">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl mb-2">Smart Financial Advisor</h2>
                <p className="text-muted-foreground">
                  Personalized recommendations based on your spending patterns
                </p>
              </div>

              {/* AI Insights Banner */}
              <Card className="mb-6 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-cyan-950/20 border-2 border-purple-400/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        AI-Powered Analysis
                        <Badge variant="secondary" className="text-xs">Premium</Badge>
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Based on your spending of ₹{totalSpent.toLocaleString()} this month, you have ₹{remainingMoney.toLocaleString()} available for strategic allocation.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-medium">
                          {underSpentCategories.length} categories under budget
                        </span>
                        {overSpentCategories.length > 0 && (
                          <>
                            <Separator orientation="vertical" className="h-4" />
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="text-red-600 font-medium">
                              {overSpentCategories.length} categories over budget
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Suggestions Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {suggestions.map((suggestion, index) => {
                  const SuggestionIcon = suggestion.icon;
                  
                  return (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className={`border-2 border-transparent hover:border-purple-400/50 transition-all cursor-pointer relative overflow-hidden group ${
                        suggestion.priority === 'high' ? 'shadow-lg shadow-purple-500/20' : ''
                      }`}>
                        {/* Glow effect for high priority */}
                        {suggestion.priority === 'high' && (
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                        
                        <CardContent className="p-6 relative z-10">
                          <div className="flex items-start gap-4 mb-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${suggestion.color} shadow-lg`}>
                              <SuggestionIcon className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold">{suggestion.title}</h3>
                                <Badge 
                                  variant={suggestion.priority === 'high' ? 'default' : 'outline'}
                                  className="text-xs"
                                >
                                  {suggestion.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {suggestion.description}
                              </p>
                            </div>
                          </div>
                          <Button 
                            className="w-full group/btn" 
                            variant={suggestion.priority === 'high' ? 'default' : 'outline'}
                            onClick={() => handleSuggestionAction(suggestion)}
                          >
                            {suggestion.action}
                            <ArrowUpRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Recommended Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-950/30 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">Increase Emergency Fund</div>
                          <div className="text-sm text-muted-foreground">Currently at 30% of target</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Add Funds
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/30 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">Review Investment Portfolio</div>
                          <div className="text-sm text-muted-foreground">Optimize your returns</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-950/30 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <div className="font-medium">Reduce Shopping Expenses</div>
                          <div className="text-sm text-muted-foreground">₹1,800 over budget</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Tips
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What If Simulator */}
              <div className="mt-10">
                <WhatIfSimulator />
              </div>
            </motion.div>
          </TabsContent>

          {/* UPI Connect Tab */}
          <TabsContent value="upi">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl mb-2">UPI Integration</h2>
                <p className="text-muted-foreground">
                  Connect your UPI account for automatic expense tracking
                </p>
              </div>

              {/* UPI Connection Card */}
              <Card className={`mb-6 border-2 ${
                upiConnected 
                  ? 'border-green-400/50 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20'
                  : 'border-blue-400/50 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20'
              }`}>
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <motion.div 
                      className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                        upiConnected 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                          : 'bg-gradient-to-br from-blue-500 to-cyan-600'
                      }`}
                      animate={upiConnected ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {upiConnected ? (
                        <Unlock className="w-10 h-10 text-white" />
                      ) : (
                        <Lock className="w-10 h-10 text-white" />
                      )}
                    </motion.div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {upiConnected ? 'UPI Account Connected' : 'Connect Your UPI Account'}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {upiConnected 
                          ? 'Your transactions are being automatically tracked and categorized'
                          : 'Enable automatic expense tracking by connecting your UPI account securely'
                        }
                      </p>
                      
                      {/* Trust Indicators */}
                      <div className="flex flex-wrap items-center gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center">
                            <Shield className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-muted-foreground">Bank-level security</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-950/30 rounded-full flex items-center justify-center">
                            <Lock className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="text-muted-foreground">256-bit encryption</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 bg-purple-100 dark:bg-purple-950/30 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-purple-600" />
                          </div>
                          <span className="text-muted-foreground">RBI approved</span>
                        </div>
                      </div>

                      <Button 
                        onClick={handleConnectUPI}
                        size="lg"
                        className={upiConnected 
                          ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                        }
                      >
                        {upiConnected ? (
                          <>
                            <Unlock className="w-5 h-5 mr-2" />
                            Disconnect UPI
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5 mr-2" />
                            Connect UPI Account
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Auto-Sync</h3>
                    <p className="text-sm text-muted-foreground">
                      Transactions automatically sync in real-time
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Smart Categorization</h3>
                    <p className="text-sm text-muted-foreground">
                      AI automatically categorizes your expenses
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Secure & Private</h3>
                    <p className="text-sm text-muted-foreground">
                      Your data is encrypted and never shared
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* How it Works */}
              <Card>
                <CardHeader>
                  <CardTitle>How UPI Integration Works</CardTitle>
                  <CardDescription>
                    Simple 3-step process to start automatic tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-blue-600">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Connect Account</h4>
                        <p className="text-sm text-muted-foreground">
                          Securely link your UPI account with bank-level authentication
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-purple-600">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Auto-Sync Transactions</h4>
                        <p className="text-sm text-muted-foreground">
                          All your UPI transactions are automatically imported and categorized
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-green-600">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Get Smart Insights</h4>
                        <p className="text-sm text-muted-foreground">
                          Receive personalized recommendations based on your spending patterns
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {upiConnected && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-400/50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-green-700 dark:text-green-400 mb-1">
                            🎉 Connection Bonus!
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            You earned 50 coins for connecting your UPI account
                          </p>
                        </div>
                        <CoinsIcon className="w-8 h-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Sentiment Analysis Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="border-2 border-purple-400/50 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20 shadow-lg hover:shadow-xl transition-all overflow-hidden relative">
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 animate-pulse" />
            
            <CardContent className="p-8 relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Brain className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl">
                        <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                          Spending Sentiment Analysis
                        </span>
                      </h3>
                      <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 text-purple-700 dark:text-purple-300 border-0">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Powered
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">
                      Discover the emotional patterns behind your spending habits with AI-driven insights
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>Happy patterns</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span>Stress indicators</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-full">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                        <span>Neutral zones</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  size="lg"
                  onClick={() => setShowSentimentModal(true)}
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all group"
                >
                  <Brain className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Analyze Emotions
                  <Sparkles className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Add Expense Modal */}
      {selectedCategory && (
        <AddExpenseModal
          open={showAddExpenseModal}
          onClose={() => setShowAddExpenseModal(false)}
          categoryId={selectedCategory.id}
          categoryName={selectedCategory.name}
          categoryColor={selectedCategory.color}
          categoryIcon={selectedCategory.icon}
          onAddExpense={handleAddExpense}
        />
      )}

      {/* Sentiment Analysis Modal */}
      <SentimentAnalysisModal
        open={showSentimentModal}
        onClose={() => setShowSentimentModal(false)}
        categories={categories}
        monthlyIncome={monthlyIncome}
        totalSpent={totalSpent}
      />
    </div>
  );
}