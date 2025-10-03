import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Target, TrendingUp, TrendingDown, Trophy, AlertTriangle, Sparkles, Calendar, Coins as CoinsIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

interface SetGoalModalProps {
  open: boolean;
  onClose: () => void;
  user: { name: string; coins: number; level: string } | null;
  onCoinsUpdate?: (coins: number) => void;
}

interface WeeklyGoal {
  id: string;
  name: string;
  weeklyLimit: number;
  currentSpending: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'achieved' | 'failed';
  coinsReward: number;
  coinsPenalty: number;
}

export default function SetGoalModal({ open, onClose, user, onCoinsUpdate }: SetGoalModalProps) {
  const [goalName, setGoalName] = useState('');
  const [weeklyLimit, setWeeklyLimit] = useState('');
  const [activeGoals, setActiveGoals] = useState<WeeklyGoal[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Load goals from localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem('weeklyGoals');
    if (savedGoals) {
      setActiveGoals(JSON.parse(savedGoals));
    }
  }, [open]);

  // Sync current spending with actual category expenses
  useEffect(() => {
    const syncSpending = () => {
      const savedCategories = localStorage.getItem('moneyCategories');
      if (!savedCategories) return;
      
      const categories = JSON.parse(savedCategories);
      const totalSpent = categories.reduce((sum: number, cat: any) => sum + cat.spent, 0);
      
      const updatedGoals = activeGoals.map(goal => {
        if (goal.status === 'active') {
          return { ...goal, currentSpending: totalSpent };
        }
        return goal;
      });

      if (JSON.stringify(updatedGoals) !== JSON.stringify(activeGoals)) {
        setActiveGoals(updatedGoals);
        localStorage.setItem('weeklyGoals', JSON.stringify(updatedGoals));
      }
    };

    if (open && activeGoals.length > 0) {
      syncSpending();
      // Set up interval to check spending every 2 seconds while modal is open
      const interval = setInterval(syncSpending, 2000);
      return () => clearInterval(interval);
    }
  }, [open, activeGoals]);

  // Check and update goal statuses
  useEffect(() => {
    const checkGoals = () => {
      const now = new Date();
      const updatedGoals = activeGoals.map(goal => {
        const endDate = new Date(goal.endDate);
        
        if (now > endDate && goal.status === 'active') {
          // Goal period ended
          if (goal.currentSpending <= goal.weeklyLimit) {
            // Goal achieved - award coins
            if (user && onCoinsUpdate) {
              onCoinsUpdate(user.coins + goal.coinsReward);
              toast.success(`🎉 Goal "${goal.name}" achieved! Earned ${goal.coinsReward} coins!`, {
                duration: 5000,
              });
            }
            return { ...goal, status: 'achieved' as const };
          } else {
            // Goal failed - deduct coins
            if (user && onCoinsUpdate) {
              const newCoins = Math.max(0, user.coins - goal.coinsPenalty);
              onCoinsUpdate(newCoins);
              toast.error(`Goal "${goal.name}" failed. Lost ${goal.coinsPenalty} coins.`, {
                duration: 5000,
              });
            }
            return { ...goal, status: 'failed' as const };
          }
        }
        return goal;
      });

      if (JSON.stringify(updatedGoals) !== JSON.stringify(activeGoals)) {
        setActiveGoals(updatedGoals);
        localStorage.setItem('weeklyGoals', JSON.stringify(updatedGoals));
      }
    };

    if (activeGoals.length > 0) {
      checkGoals();
    }
  }, [activeGoals, user, onCoinsUpdate]);

  const calculateWeekEnd = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + daysUntilSunday);
    endDate.setHours(23, 59, 59, 999);
    return endDate;
  };

  const handleCreateGoal = () => {
    if (!goalName || !weeklyLimit || parseInt(weeklyLimit) <= 0) {
      toast.error('Please enter a valid goal name and weekly limit');
      return;
    }

    const limit = parseInt(weeklyLimit);
    const now = new Date();
    const endDate = calculateWeekEnd();

    // Get actual current spending from categories
    const savedCategories = localStorage.getItem('moneyCategories');
    let currentSpending = 0;
    if (savedCategories) {
      const categories = JSON.parse(savedCategories);
      currentSpending = categories.reduce((sum: number, cat: any) => sum + cat.spent, 0);
    }

    const newGoal: WeeklyGoal = {
      id: Date.now().toString(),
      name: goalName,
      weeklyLimit: limit,
      currentSpending: currentSpending, // Use actual spending from categories
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      status: 'active',
      coinsReward: Math.floor(limit / 100), // 1 coin per 100 rupees saved
      coinsPenalty: Math.floor(limit / 200), // Half the reward as penalty
    };

    const updatedGoals = [...activeGoals, newGoal];
    setActiveGoals(updatedGoals);
    localStorage.setItem('weeklyGoals', JSON.stringify(updatedGoals));

    toast.success(`Goal "${goalName}" created successfully!`);
    setGoalName('');
    setWeeklyLimit('');
    setShowCreateForm(false);

    // Award coins for creating a goal
    if (user && onCoinsUpdate) {
      onCoinsUpdate(user.coins + 10);
      toast.success('🪙 Earned 10 coins for setting a goal!');
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    const updatedGoals = activeGoals.filter(g => g.id !== goalId);
    setActiveGoals(updatedGoals);
    localStorage.setItem('weeklyGoals', JSON.stringify(updatedGoals));
    toast.success('Goal deleted');
  };



  const getProgressColor = (percentage: number) => {
    if (percentage <= 50) return 'bg-green-500';
    if (percentage <= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            Weekly Spending Goals
          </DialogTitle>
          <DialogDescription>
            Set weekly spending limits and track your progress to earn coins
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Info Banner */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                    How It Works
                  </h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Set weekly spending limits and earn coins for staying within budget! 
                    Your spending automatically syncs from Money Manager categories. 
                    Stay under your limit to earn coins, or lose coins if you exceed it!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create New Goal Button */}
          {!showCreateForm && (
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Target className="w-4 h-4 mr-2" />
              Create New Goal
            </Button>
          )}

          {/* Create Goal Form */}
          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="border-2 border-purple-300 dark:border-purple-700">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label htmlFor="goalName">Goal Name</Label>
                      <Input
                        id="goalName"
                        placeholder="e.g., Coffee Budget, Entertainment Limit"
                        value={goalName}
                        onChange={(e) => setGoalName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weeklyLimit">Weekly Spending Limit (₹)</Label>
                      <Input
                        id="weeklyLimit"
                        type="number"
                        placeholder="e.g., 2000"
                        value={weeklyLimit}
                        onChange={(e) => setWeeklyLimit(e.target.value)}
                        className="mt-1"
                      />
                      {weeklyLimit && parseInt(weeklyLimit) > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          🪙 Reward: <span className="font-semibold text-green-600">{Math.floor(parseInt(weeklyLimit) / 100)} coins</span> if you stay within limit
                          <br />
                          ⚠️ Penalty: <span className="font-semibold text-red-600">{Math.floor(parseInt(weeklyLimit) / 200)} coins</span> if you exceed limit
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateGoal} className="flex-1">
                        Create Goal
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowCreateForm(false);
                          setGoalName('');
                          setWeeklyLimit('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Goals */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Your Goals</h3>
            
            {activeGoals.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No active goals yet. Create your first goal to start earning coins!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {activeGoals.map((goal) => {
                  const percentage = Math.min((goal.currentSpending / goal.weeklyLimit) * 100, 100);
                  const daysRemaining = getDaysRemaining(goal.endDate);
                  const isOnTrack = percentage <= 100;

                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Card className={`border-2 ${
                        goal.status === 'achieved' 
                          ? 'border-green-400 bg-green-50 dark:bg-green-950/20' 
                          : goal.status === 'failed'
                          ? 'border-red-400 bg-red-50 dark:bg-red-950/20'
                          : isOnTrack 
                          ? 'border-blue-400' 
                          : 'border-orange-400'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{goal.name}</h4>
                                {goal.status === 'active' && (
                                  <Badge variant={isOnTrack ? 'default' : 'destructive'} className="text-xs">
                                    {daysRemaining} days left
                                  </Badge>
                                )}
                                {goal.status === 'achieved' && (
                                  <Badge className="bg-green-600 text-xs">
                                    <Trophy className="w-3 h-3 mr-1" />
                                    Achieved
                                  </Badge>
                                )}
                                {goal.status === 'failed' && (
                                  <Badge variant="destructive" className="text-xs">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Failed
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Weekly Limit: ₹{goal.weeklyLimit.toLocaleString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGoal(goal.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">
                                ₹{goal.currentSpending.toLocaleString()} spent
                              </span>
                              <span className={percentage > 100 ? 'text-red-600 font-semibold' : 'text-muted-foreground'}>
                                {percentage.toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(percentage, 100)}%` }}
                                className={`h-full ${getProgressColor(percentage)} transition-all duration-500`}
                              />
                            </div>
                          </div>

                          {/* Remaining & Rewards */}
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                              <p className={`font-semibold ${
                                goal.weeklyLimit - goal.currentSpending >= 0 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                ₹{Math.abs(goal.weeklyLimit - goal.currentSpending).toLocaleString()}
                                {goal.weeklyLimit - goal.currentSpending < 0 && ' over'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                {isOnTrack ? 'Potential Reward' : 'Potential Penalty'}
                              </p>
                              <p className={`font-semibold flex items-center gap-1 ${
                                isOnTrack ? 'text-green-600' : 'text-red-600'
                              }`}>
                                <CoinsIcon className="w-4 h-4" />
                                {isOnTrack ? `+${goal.coinsReward}` : `-${goal.coinsPenalty}`}
                              </p>
                            </div>
                          </div>

                          {/* Info about automatic tracking */}
                          {goal.status === 'active' && (
                            <div className="mt-4 pt-4 border-t">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Spending automatically syncs from your category expenses
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
