// Financial Data Service - Simulates real financial data
import { User } from './api';

export interface FinancialStats {
  totalUsers: number;
  totalMoneySaved: number;
  averageRating: number;
  monthlyActiveUsers: number;
}

export interface UserFinancialData {
  monthlyIncome: number;
  totalExpenses: number;
  totalSavings: number;
  savingsRate: number;
  expenseCategories: {
    name: string;
    spent: number;
    limit: number;
    percentage: number;
    color: string;
  }[];
  recentTransactions: {
    id: string;
    type: 'income' | 'expense' | 'achievement';
    title: string;
    amount: string;
    time: string;
    icon: string;
  }[];
  savingsGoals: {
    name: string;
    current: number;
    target: number;
    color: string;
  }[];
  weeklyTrends: {
    week: string;
    spending: number;
    limit: number;
  }[];
  streak: number;
  achievements: {
    name: string;
    description: string;
    earned: boolean;
    icon: string;
  }[];
}

export interface PlatformStats {
  totalUsers: number;
  totalMoneySaved: number;
  averageRating: number;
  gamesCompleted: number;
  activeUsers: number;
  moneySaved: number;
  userRating: number;
}

class FinancialDataService {
  private static instance: FinancialDataService;
  private userDataCache: Map<string, UserFinancialData> = new Map();
  private platformStatsCache: PlatformStats | null = null;

  static getInstance(): FinancialDataService {
    if (!FinancialDataService.instance) {
      FinancialDataService.instance = new FinancialDataService();
    }
    return FinancialDataService.instance;
  }

  // Generate realistic financial data based on user profile
  generateUserFinancialData(user: User): UserFinancialData {
    const cacheKey = user.id;
    
    if (this.userDataCache.has(cacheKey)) {
      return this.userDataCache.get(cacheKey)!;
    }

    // Generate data based on user level and coins
    const levelMultiplier = this.getLevelMultiplier(user.level);
    const baseIncome = 30000 + (user.coins * 50); // Higher coins = higher income
    const monthlyIncome = Math.round(baseIncome * levelMultiplier);

    const expenseCategories = [
      { name: 'Food & Dining', spent: Math.round(8500 * levelMultiplier), limit: Math.round(12000 * levelMultiplier), percentage: 71, color: '#10b981' },
      { name: 'Entertainment', spent: Math.round(3200 * levelMultiplier), limit: Math.round(5000 * levelMultiplier), percentage: 64, color: '#8b5cf6' },
      { name: 'Travel', spent: Math.round(4500 * levelMultiplier), limit: Math.round(6000 * levelMultiplier), percentage: 75, color: '#3b82f6' },
      { name: 'Shopping', spent: Math.round(9800 * levelMultiplier), limit: Math.round(8000 * levelMultiplier), percentage: 122, color: '#ec4899' },
      { name: 'Savings & Investment', spent: Math.round(5000 * levelMultiplier), limit: Math.round(10000 * levelMultiplier), percentage: 50, color: '#059669' },
      { name: 'Insurance', spent: Math.round(2000 * levelMultiplier), limit: Math.round(3000 * levelMultiplier), percentage: 67, color: '#0ea5e9' },
      { name: 'Emergency Fund', spent: Math.round(1500 * levelMultiplier), limit: Math.round(5000 * levelMultiplier), percentage: 30, color: '#ef4444' },
      { name: 'Miscellaneous', spent: Math.round(2300 * levelMultiplier), limit: Math.round(4000 * levelMultiplier), percentage: 58, color: '#f59e0b' },
    ];

    const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.spent, 0);
    const totalSavings = monthlyIncome - totalExpenses;
    const savingsRate = (totalSavings / monthlyIncome) * 100;

    const recentTransactions = [
      { id: '1', type: 'expense' as const, title: 'Coffee Shop', amount: '₹250', time: '2 hours ago', icon: 'CreditCard' },
      { id: '2', type: 'income' as const, title: 'Salary Credited', amount: `₹${monthlyIncome.toLocaleString()}`, time: 'Today', icon: 'DollarSign' },
      { id: '3', type: 'achievement' as const, title: 'Earned "Saver" Badge', amount: '+100 coins', time: 'Yesterday', icon: 'Trophy' },
    ];

    const savingsGoals = [
      { name: 'Emergency Fund', current: Math.round(45000 * levelMultiplier), target: Math.round(100000 * levelMultiplier), color: 'green' },
      { name: 'Vacation', current: Math.round(15000 * levelMultiplier), target: Math.round(50000 * levelMultiplier), color: 'blue' },
      { name: 'New Laptop', current: Math.round(35000 * levelMultiplier), target: Math.round(80000 * levelMultiplier), color: 'purple' },
    ];

    const weeklyTrends = [
      { week: 'Week 1', spending: Math.round(8500 * levelMultiplier), limit: Math.round(10000 * levelMultiplier) },
      { week: 'Week 2', spending: Math.round(9200 * levelMultiplier), limit: Math.round(10000 * levelMultiplier) },
      { week: 'Week 3', spending: Math.round(11200 * levelMultiplier), limit: Math.round(10000 * levelMultiplier) },
      { week: 'Week 4', spending: Math.round(8100 * levelMultiplier), limit: Math.round(10000 * levelMultiplier) },
    ];

    const streak = Math.min(30, Math.floor(user.coins / 10) + 7); // Based on coins earned

    const achievements = [
      { name: 'First Saver', description: 'Saved your first ₹1000', earned: user.coins > 50, icon: 'Trophy' },
      { name: 'Quiz Master', description: 'Completed 5 quizzes', earned: user.completedQuiz, icon: 'Brain' },
      { name: 'Goal Crusher', description: 'Achieved 3 savings goals', earned: user.coins > 200, icon: 'Target' },
      { name: 'Streak Keeper', description: '7-day login streak', earned: streak >= 7, icon: 'Flame' },
    ];

    const data: UserFinancialData = {
      monthlyIncome,
      totalExpenses,
      totalSavings,
      savingsRate,
      expenseCategories,
      recentTransactions,
      savingsGoals,
      weeklyTrends,
      streak,
      achievements,
    };

    this.userDataCache.set(cacheKey, data);
    return data;
  }

  // Get platform-wide statistics
  getPlatformStats(): PlatformStats {
    if (this.platformStatsCache) {
      return this.platformStatsCache;
    }

    // Simulate real platform statistics
    const stats: PlatformStats = {
      totalUsers: 12450,
      totalMoneySaved: 520000000, // ₹52Cr
      averageRating: 4.8,
      gamesCompleted: 67890,
      activeUsers: 12450,
      moneySaved: 520000000,
      userRating: 4.8,
    };

    this.platformStatsCache = stats;
    return stats;
  }

  // Get user-specific statistics for dashboard
  getUserDashboardStats(user: User) {
    const financialData = this.generateUserFinancialData(user);
    
    return {
      totalIncome: financialData.monthlyIncome,
      totalExpense: financialData.totalExpenses,
      totalSavings: financialData.totalSavings,
      savingsRate: financialData.savingsRate,
      streak: financialData.streak,
      achievements: financialData.achievements,
      recentActivities: financialData.recentTransactions,
      savingsGoals: financialData.savingsGoals,
      categoryData: financialData.expenseCategories,
      weeklyTrends: financialData.weeklyTrends,
    };
  }

  // Get money management data
  getMoneyManagementData(user: User) {
    const financialData = this.generateUserFinancialData(user);
    
    return {
      monthlyIncome: financialData.monthlyIncome,
      categories: financialData.expenseCategories,
      totalSpent: financialData.totalExpenses,
      remainingMoney: financialData.monthlyIncome - financialData.totalExpenses,
      spendingPercentage: (financialData.totalExpenses / financialData.monthlyIncome) * 100,
      weeklyTrends: financialData.weeklyTrends,
    };
  }

  // Get about page statistics
  getAboutPageStats(): PlatformStats {
    return this.getPlatformStats();
  }

  // Helper method to get level multiplier
  private getLevelMultiplier(level: string): number {
    switch (level) {
      case 'Beginner': return 1.0;
      case 'Intermediate': return 1.3;
      case 'Advanced': return 1.6;
      case 'Expert': return 2.0;
      default: return 1.0;
    }
  }

  // Clear cache (useful for testing or when user data changes)
  clearCache(userId?: string): void {
    if (userId) {
      this.userDataCache.delete(userId);
    } else {
      this.userDataCache.clear();
      this.platformStatsCache = null;
    }
  }

  // Update user data (when user makes changes)
  updateUserData(userId: string, updates: Partial<UserFinancialData>): void {
    const existingData = this.userDataCache.get(userId);
    if (existingData) {
      const updatedData = { ...existingData, ...updates };
      this.userDataCache.set(userId, updatedData);
    }
  }
}

export const financialDataService = FinancialDataService.getInstance();
export default financialDataService;
