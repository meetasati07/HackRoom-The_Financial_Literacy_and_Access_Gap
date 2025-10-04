import { motion, AnimatePresence } from 'motion/react';
import { X, Smile, Frown, Meh, Brain, TrendingUp, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';

interface SentimentAnalysisModalProps {
  open: boolean;
  onClose: () => void;
  categories: Array<{
    id: string;
    name: string;
    spent: number;
    limit: number;
    percentage: number;
  }>;
  monthlyIncome: number;
  totalSpent: number;
}

interface SentimentData {
  name: string;
  value: number;
  color: string;
  icon: any;
  description: string;
}

export default function SentimentAnalysisModal({ 
  open, 
  onClose, 
  categories,
  monthlyIncome,
  totalSpent
}: SentimentAnalysisModalProps) {
  if (!open) return null;

  // Analyze spending patterns to determine emotional sentiment
  const analyzeSentiment = (): { 
    data: SentimentData[]; 
    insights: string[];
    dominantEmotion: string;
  } => {
    let happyScore = 0;
    let stressedScore = 0;
    let neutralScore = 0;

    const insights: string[] = [];
    
    // Calculate spending percentage of income
    const spendingPercentage = (totalSpent / monthlyIncome) * 100;

    // Analyze each category
    categories.forEach(cat => {
      if (cat.percentage <= 70) {
        // Well managed - contributes to happiness
        happyScore += 1;
      } else if (cat.percentage > 100) {
        // Overspending - contributes to stress
        stressedScore += 1.5; // Weight overspending more heavily
      } else {
        // Moderate spending - neutral
        neutralScore += 1;
      }
    });

    // Overall spending analysis
    if (spendingPercentage < 70) {
      happyScore += 2;
      insights.push('Great job! You\'re spending well below your income.');
    } else if (spendingPercentage > 90) {
      stressedScore += 2;
      insights.push('Warning: You\'re using most of your monthly income.');
    } else {
      neutralScore += 1;
      insights.push('Your overall spending is moderate.');
    }

    // Count overspent and well-managed categories
    const overSpent = categories.filter(c => c.percentage > 100).length;
    const wellManaged = categories.filter(c => c.percentage < 70).length;

    if (overSpent > 0) {
      insights.push(`${overSpent} ${overSpent === 1 ? 'category is' : 'categories are'} over budget.`);
    }

    if (wellManaged >= categories.length / 2) {
      happyScore += 1;
      insights.push(`${wellManaged} ${wellManaged === 1 ? 'category is' : 'categories are'} well managed!`);
    }

    // Savings analysis
    const remainingBalance = monthlyIncome - totalSpent;
    if (remainingBalance > monthlyIncome * 0.3) {
      happyScore += 1;
      insights.push('Excellent savings rate!');
    } else if (remainingBalance < monthlyIncome * 0.1) {
      stressedScore += 1;
      insights.push('Low savings - consider reducing expenses.');
    }

    // Normalize scores to percentages
    const totalScore = happyScore + stressedScore + neutralScore;
    const happyPercentage = Math.round((happyScore / totalScore) * 100);
    const stressedPercentage = Math.round((stressedScore / totalScore) * 100);
    const neutralPercentage = 100 - happyPercentage - stressedPercentage;

    const data: SentimentData[] = [
      {
        name: 'Happy',
        value: happyPercentage,
        color: '#10b981',
        icon: Smile,
        description: 'Positive spending behavior'
      },
      {
        name: 'Stressed',
        value: stressedPercentage,
        color: '#ef4444',
        icon: Frown,
        description: 'Areas needing attention'
      },
      {
        name: 'Neutral',
        value: neutralPercentage,
        color: '#f59e0b',
        icon: Meh,
        description: 'Moderate spending patterns'
      }
    ].filter(item => item.value > 0); // Only include non-zero values

    // Determine dominant emotion
    let dominantEmotion = 'Neutral';
    if (happyPercentage > stressedPercentage && happyPercentage > neutralPercentage) {
      dominantEmotion = 'Happy';
    } else if (stressedPercentage > happyPercentage && stressedPercentage > neutralPercentage) {
      dominantEmotion = 'Stressed';
    }

    return { data, insights, dominantEmotion };
  };

  const { data, insights, dominantEmotion } = analyzeSentiment();

  const getEmotionGradient = () => {
    switch (dominantEmotion) {
      case 'Happy':
        return 'from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20';
      case 'Stressed':
        return 'from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20';
      default:
        return 'from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20';
    }
  };

  const getEmotionIcon = () => {
    switch (dominantEmotion) {
      case 'Happy':
        return <Smile className="w-8 h-8 text-green-600" />;
      case 'Stressed':
        return <Frown className="w-8 h-8 text-red-600" />;
      default:
        return <Meh className="w-8 h-8 text-orange-600" />;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border-2 border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold" style={{ color: data.payload.color }}>
            {data.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {data.value}% of your spending pattern
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className={`border-2 shadow-2xl bg-gradient-to-br ${getEmotionGradient()}`}>
                <CardContent className="p-4 sm:p-6 md:p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4 sm:mb-6 gap-2">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl sm:text-2xl md:text-3xl mb-1 leading-tight">
                          <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                            Spending Sentiment Analysis
                          </span>
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          AI-powered emotional insights based on your spending patterns
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="rounded-full hover:bg-background/50 flex-shrink-0"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>

                  {/* Dominant Emotion Banner */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-4 sm:mb-6"
                  >
                    <Card className="bg-background/50 backdrop-blur-sm border-2">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            className="flex-shrink-0"
                          >
                            {getEmotionIcon()}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-base sm:text-lg md:text-xl">Overall Financial Mood:</h3>
                              <Badge variant="outline" className="text-xs sm:text-sm md:text-base px-2 sm:px-3 py-0.5 sm:py-1">
                                {dominantEmotion}
                              </Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                              {dominantEmotion === 'Happy' && 'Your spending habits are healthy and well-balanced! Keep up the great work.'}
                              {dominantEmotion === 'Stressed' && 'Some spending patterns need attention. Review the insights below to improve.'}
                              {dominantEmotion === 'Neutral' && 'Your spending is moderate. Small improvements can make a big difference.'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    {/* Pie Chart */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Card className="bg-background/50 backdrop-blur-sm border-2 h-full">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                            <h3 className="text-base sm:text-lg">Emotional Distribution</h3>
                          </div>
                          
                          <div className="relative">
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie
                                  data={data}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={false}
                                  outerRadius={100}
                                  innerRadius={60}
                                  fill="#8884d8"
                                  dataKey="value"
                                  animationDuration={1000}
                                  animationBegin={0}
                                >
                                  {data.map((entry, index) => (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={entry.color}
                                      stroke="#fff"
                                      strokeWidth={3}
                                      style={{
                                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
                                      }}
                                    />
                                  ))}
                                </Pie>
                                <RechartsTooltip content={<CustomTooltip />} />
                              </PieChart>
                            </ResponsiveContainer>

                            {/* Center Text */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                              <div className="text-sm text-muted-foreground">Your</div>
                              <div className="text-lg">Spending</div>
                              <div className="text-sm text-muted-foreground">Mood</div>
                            </div>
                          </div>

                          {/* Legend */}
                          <div className="grid grid-cols-1 gap-3 mt-4">
                            {data.map((item) => {
                              const Icon = item.icon;
                              return (
                                <div 
                                  key={item.name}
                                  className="flex items-center justify-between p-3 rounded-lg bg-background/70 hover:bg-background transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-4 h-4 rounded-full" 
                                      style={{ backgroundColor: item.color }}
                                    />
                                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                                    <div>
                                      <div className="font-medium">{item.name}</div>
                                      <div className="text-xs text-muted-foreground">{item.description}</div>
                                    </div>
                                  </div>
                                  <div className="font-bold text-lg" style={{ color: item.color }}>
                                    {item.value}%
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Insights Panel */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Card className="bg-background/50 backdrop-blur-sm border-2 h-full">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg">Key Insights</h3>
                          </div>

                          <div className="space-y-3">
                            {insights.map((insight, index) => {
                              const isPositive = insight.toLowerCase().includes('great') || 
                                               insight.toLowerCase().includes('excellent') || 
                                               insight.toLowerCase().includes('well managed');
                              const isNegative = insight.toLowerCase().includes('warning') || 
                                               insight.toLowerCase().includes('over budget') ||
                                               insight.toLowerCase().includes('low savings');
                              
                              return (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.5 + index * 0.1 }}
                                  className={`flex items-start gap-3 p-3 rounded-lg ${
                                    isPositive 
                                      ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900' 
                                      : isNegative 
                                      ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900'
                                      : 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900'
                                  }`}
                                >
                                  {isPositive && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
                                  {isNegative && <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                                  {!isPositive && !isNegative && <Meh className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />}
                                  <p className="text-sm flex-1">{insight}</p>
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* Quick Stats */}
                          <div className="mt-6 grid grid-cols-2 gap-3">
                            <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg">
                              <div className="text-xs text-muted-foreground mb-1">Total Spent</div>
                              <div className="text-xl font-bold text-purple-600">
                                ₹{totalSpent.toLocaleString()}
                              </div>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg">
                              <div className="text-xs text-muted-foreground mb-1">Categories</div>
                              <div className="text-xl font-bold text-blue-600">
                                {categories.length}
                              </div>
                            </div>
                          </div>

                          {/* Action Recommendations */}
                          <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg border-2 border-purple-300 dark:border-purple-800">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-purple-600" />
                              Recommended Actions
                            </h4>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                              {dominantEmotion === 'Happy' && (
                                <>
                                  <li>• Continue your excellent spending habits</li>
                                  <li>• Consider increasing your savings goals</li>
                                  <li>• Explore investment opportunities</li>
                                </>
                              )}
                              {dominantEmotion === 'Stressed' && (
                                <>
                                  <li>• Review and reduce overspending categories</li>
                                  <li>• Set stricter budget limits</li>
                                  <li>• Look for ways to increase income</li>
                                </>
                              )}
                              {dominantEmotion === 'Neutral' && (
                                <>
                                  <li>• Fine-tune your budget allocations</li>
                                  <li>• Track expenses more consistently</li>
                                  <li>• Aim to improve by 10% each month</li>
                                </>
                              )}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end">
                    <Button 
                      onClick={onClose}
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Got It!
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
